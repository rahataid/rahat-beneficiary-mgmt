# Beneficiary Import Pipeline

This document explains how beneficiary data is imported from an Excel/CSV file into the system, covering every stage from the HTTP request to the final database rows.

---

## Overview

The import uses an **R2 + staging table pipeline** to make the process:

- **Atomic** — the entire import succeeds or fails as one database transaction
- **Resumable** — the raw CSV is stored in Cloudflare R2 before any DB work begins, so Bull can retry the job without re-uploading
- **Idempotent** — all upserts use `ON CONFLICT` so re-running against the same data is safe
- **Auditable** — after a successful import the CSV is moved to an `archive/` folder in R2, never deleted

---

## End-to-End Flow

```
POST /sources  (action=IMPORT)
        │
        ▼
SourceService.createSourceAndAddToQueue()
  1. Serialize validated records → CSV buffer
  2. Upload CSV to R2  →  key: staged/<importId>.csv
  3. Store Source row  →  fieldMapping.columnMap, stagedFileKey, importProgress=PENDING
  4. Push Bull job     →  job.beneficiary.import { sourceUUID }
        │
        ▼
BeneficiaryProcessor.importBeneficiary()   [Bull worker]
  Awaits BeneficiaryImportService.importBySourceUUID(sourceUUID)
        │
        ▼
BeneficiaryImportService.importBySourceUUID()
  1. Load Source row, verify stagedFileKey exists
  2. Mark importProgress → IN_PROGRESS
  3. Download CSV from R2
  4. Parse CSV → []records
  5. Split primary fields vs extras
  6. Create/upsert default group + import group
  7. runCopyPipeline()  ← single Prisma transaction
  8. Mark importProgress → DONE, isImported = true
  9. Archive CSV in R2  →  key: archive/staged/<importId>.csv
 10. Emit BeneficiaryEvents.BENEFICIARY_CREATED
```

---

## Stage-by-Stage Detail

### 1. HTTP Request — `POST /sources`

The frontend sends a multipart or JSON payload containing:

```json
{
  "action": "IMPORT",
  "importId": "<uuid>",
  "name": "My Import",
  "fieldMapping": {
    "data": [ ...raw rows... ],
    "sourceTargetMappings": [
      { "sourceField": "First Name", "targetField": "firstName" },
      { "sourceField": "Phone",      "targetField": "phone" }
    ]
  }
}
```

`sourceTargetMappings` tells the service how to map the spreadsheet column headers to the beneficiary schema fields.

---

### 2. CSV Serialisation & R2 Upload

`SourceService.serializeToCSV()` converts the validated, UUID-enriched records to a CSV buffer using `fast-csv`.

The buffer is uploaded to Cloudflare R2 under the key:

```
staged/<importId>.csv
```

The `Source` row is written to `tbl_sources` with:

| Column | Value |
|---|---|
| `fieldMapping` | `{ "columnMap": [{ "sourceField": "...", "targetField": "..." }] }` |
| `stagedFileKey` | `staged/<importId>.csv` |
| `importProgress` | `{ "status": "PENDING", "total": N, "imported": 0, "failed": 0, ... }` |
| `isImported` | `false` |

> `fieldMapping` stores **only the column map** — the raw data blob is never written to the database.

---

### 3. Bull Job

A job is pushed to the `job.beneficiary.import` queue with `{ sourceUUID }`.

Bull retry config: **3 attempts, 2-second backoff**. Because the CSV is already in R2, retries simply re-download and re-run the pipeline — no re-upload needed.

---

### 4. `tbl_beneficiary_staging` — Purpose & Structure

`tbl_beneficiary_staging` is a **temporary, single-use scratch table** that acts as a fast loading buffer between the CSV and `tbl_beneficiaries`.

#### Why it exists

Inserting thousands of rows one-by-one via Prisma `createMany` is slow and not atomic. The staging pattern allows:

1. A **bulk chunked INSERT** into a plain unindexed table (fast)
2. A single **`INSERT ... SELECT ... ON CONFLICT DO UPDATE`** from staging into the real table (atomic, one statement)

This means `tbl_beneficiaries` is touched by exactly **one SQL statement** regardless of how many rows are being imported.

#### Schema

```sql
CREATE TABLE tbl_beneficiary_staging (
  uuid          TEXT,
  "firstName"   TEXT,
  "lastName"    TEXT,
  phone         TEXT,
  email         TEXT,
  "govtIDNumber" TEXT,
  gender        TEXT,
  "birthDate"   TEXT,
  "walletAddress" TEXT,
  location      TEXT,
  latitude      TEXT,
  longitude     TEXT,
  notes         TEXT,
  "bankedStatus"   TEXT,
  "internetStatus" TEXT,
  "phoneStatus"    TEXT,
  extras        TEXT,   -- JSON string, parsed to jsonb on final upsert
  "createdBy"   TEXT
);
```

All columns are plain `TEXT` — no types, no constraints, no indexes. Type casting happens in the final upsert SQL, not here.

#### Lifecycle

| Step | Action |
|---|---|
| Start of each import | `TRUNCATE TABLE tbl_beneficiary_staging` |
| Step 2 | Chunked `INSERT` — 1000 rows per statement |
| Step 3 | `INSERT INTO tbl_beneficiaries ... SELECT ... FROM tbl_beneficiary_staging` |
| End of transaction | `TRUNCATE TABLE tbl_beneficiary_staging` — cleaned up once data is safely committed |

> The staging table is always empty outside of an active import transaction.

---

### 5. The Copy Pipeline Transaction

Everything inside `runCopyPipeline()` runs in a single Prisma interactive transaction with a **5-minute timeout**.

```
BEGIN
  TRUNCATE tbl_beneficiary_staging
  INSERT INTO tbl_beneficiary_staging ... (chunked, 1000 rows/chunk)
  INSERT INTO tbl_beneficiaries ... SELECT ... FROM tbl_beneficiary_staging
    ON CONFLICT (uuid) DO UPDATE SET ...      ← upsert: update existing beneficiaries
  INSERT INTO tbl_beneficiary_groups ...      ← add to default group
    ON CONFLICT ("beneficiaryUID", "groupUID") DO NOTHING
  INSERT INTO tbl_beneficiary_groups ...      ← add to import group
    ON CONFLICT ("beneficiaryUID", "groupUID") DO NOTHING
  INSERT INTO tbl_beneficiary_sources ...     ← link to source
    ON CONFLICT ("beneficiaryUID", "sourceUID") DO NOTHING
  SELECT COUNT(*) FROM tbl_beneficiary_staging   ← capture imported count
  TRUNCATE tbl_beneficiary_staging               ← clean up; table left empty on commit
COMMIT
```

If any step throws, the entire transaction rolls back — `tbl_beneficiaries` is left unchanged.

---

### 6. Post-Import

On success:

1. `importProgress` is updated to `{ status: "DONE", imported: N, completedAt: "..." }`
2. `isImported` is set to `true` on the `Source` row
3. The CSV is **moved** from `staged/<importId>.csv` to `archive/staged/<importId>.csv` in R2
   - This is a Copy + Delete operation (R2 has no native rename)
   - `stagedFileKey` on the `Source` row is updated to the new archive path
   - If archiving fails it is logged as a warning — the import is **not** rolled back
4. `BeneficiaryEvents.BENEFICIARY_CREATED` is emitted

On failure:

1. `importProgress` is updated to `{ status: "FAILED", error: "...", completedAt: "..." }`
2. The error is re-thrown so Bull can retry the job (up to 3 attempts)
3. The CSV remains at its original `staged/` key so retries can re-download it

---

## Import Progress Tracking

Poll `GET /sources/:uuid/import-status` to check progress.

Response shape:

```json
{
  "status": "PENDING | IN_PROGRESS | DONE | FAILED",
  "total": 500,
  "imported": 500,
  "failed": 0,
  "startedAt": "2026-05-12T10:00:00.000Z",
  "completedAt": "2026-05-12T10:00:45.000Z",
  "error": null
}
```

---

## R2 Key Conventions

| State | R2 Key |
|---|---|
| Uploaded, awaiting import | `staged/<importId>.csv` |
| Import complete (archived) | `archive/staged/<importId>.csv` |

---

## Key Files

| File | Role |
|---|---|
| `apps/rahat-community/src/app/sources/source.service.ts` | Serialises CSV, uploads to R2, creates Source row, enqueues Bull job |
| `apps/rahat-community/src/app/processors/beneficiary.processor.ts` | Bull worker — receives job and awaits import |
| `apps/rahat-community/src/app/beneficiary-import/beneficiary-import.service.ts` | Core pipeline: R2 download → parse → staging → upsert → archive |
| `apps/rahat-community/src/app/export/helpers/r2-upload.helper.ts` | R2 helpers: `uploadToR2`, `downloadFromR2`, `archiveInR2` |
| `prisma/migrations/20260512011350_add_staged_import_columns/migration.sql` | DDL for `tbl_beneficiary_staging` and new columns on `tbl_sources` |
