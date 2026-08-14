# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Community Tool** is a beneficiary management system built with NestJS that provides targeting, grouping, and reporting capabilities based on geographical, social, economic, and physical indicators. It's a monorepo using Nx with a PostgreSQL backend, Redis job queues, and S3/R2 file storage.

## Repository Structure

- **apps/rahat-community** — Main NestJS backend application
- **apps/rahat-community-e2e** — E2E test suite
- **libs/types** — Shared TypeScript types and interfaces
- **libs/sdk** — TypeScript SDK exported as `@rahataid/community-tool-sdk`
- **libs/stats** — Stats aggregation module
- **libs/extentions** — Shared extensions and utilities
- **prisma/** — Database schema and migrations
- **docs/** — API documentation and feature guides
- **bruno/** — API testing collection (REST client)

## Common Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start dev server (NestJS backend on PORT 5505 by default)
pnpm dev

# Build everything
pnpm build:all

# Build specific app
pnpm build:rahat-com

# Run tests (E2E)
pnpm test

# Run Prisma migrations
npx prisma migrate dev

# Seed database (local)
npx prisma db seed --preview-feature
# Or via package.json script
pnpm setup-data

# Generate Prisma client after schema changes
pnpm prisma:generate

# Lint code
npx nx lint rahat-community

# Run linter on specific file
npx nx lint rahat-community --files=apps/rahat-community/src/app/beneficiaries
```

### Running a Single Test

E2E tests use Jest. To run a specific test:

```bash
npx nx test rahat-community-e2e:e2e --testFile=beneficiaries.e2e-spec.ts
```

## Architecture & Key Concepts

### Core Modules (in `apps/rahat-community/src/app/`)

- **beneficiaries** — Core beneficiary CRUD, data validation, and statistics
- **groups** — Grouping logic for beneficiaries (static/manual groups)
- **beneficiary-groups** — Join table managing beneficiary-group relationships
- **targets** — Targeting rules and target evaluation
- **sources** — Data import sources and definitions
- **beneficiary-sources** — Join table linking beneficiaries to import sources
- **beneficiary-import** — CSV/Excel import pipeline with validation and staging
- **field-definitions** — Configurable custom fields for beneficiaries
- **export** — Data export functionality (CSV, Excel)
- **beneficiary-comms** — Communication tracking for beneficiaries
- **comms** — General communications module
- **auditLog** — Audit trail of changes
- **gateway** — WebSocket integration (Socket.io)
- **processors** — Bull job processors for async work (imports, exports, etc.)
- **schedulers** — Scheduled tasks using `@nestjs/schedule`

### Database

**Prisma** is used for database access. Key entities:

- `Beneficiary` — Core beneficiary with demographics, location, financial/internet/phone status
- `BeneficiaryArchive` — Soft-deleted beneficiary records
- `Group` — Beneficiary groups (e.g., "Vulnerable Women")
- `BeneficiaryGroup` — Join table for group membership
- `Source` — Import source definitions
- `BeneficiarySource` — Tracks which beneficiaries came from which source
- `FieldDefinition` — Customizable extra fields (stored in `Beneficiary.extras` JSONB)
- `Target` — Targeting rules and configurations
- `TargetResult` — Results of target evaluations

**GIN Index on extras**: The `beneficiary.extras` JSONB field has a GIN index (`@@index([extras(ops: JsonbPathOps)], type: Gin)`) for efficient querying on dynamic fields.

### Job Queue & Async Processing

- **Bull/Redis** is used for asynchronous job processing
- Common job types: beneficiary imports, exports, data sync
- Jobs are processed by Bull processors in `processors/`
- Redis connection configured via env vars: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### Import Pipeline

1. **File Upload** — CSV/Excel uploaded to S3/R2
2. **Staging** — File stored in staging, validation runs
3. **Processing** — Bull job processes file in batches
4. **Mapping** — Field mapping (source columns → Beneficiary fields + extras)
5. **Deduplication** — Phone/email/govtID checks for duplicates
6. **Persistence** — Beneficiaries created/updated; old records archived
7. **Events** — Listeners emit events on import completion

### Targeting

Targets use configurable rules to select subsets of beneficiaries. Results stored in `TargetResult` table. Targets can be:

- **Geographic** — Location-based
- **Demographic** — Age, gender, etc.
- **Status-based** — Banking, internet, phone status
- **Custom field filters** — On `Beneficiary.extras` (leverages GIN index)

## Key Dependencies & Technologies

- **NestJS** (`@nestjs/*`) — Backend framework
- **Prisma** (`@prisma/client`, `prisma`) — ORM
- **Bull** (`@nestjs/bull`, `bull`) — Job queue
- **Rumsan packages** — `@rumsan/core`, `@rumsan/user`, `@rumsan/prisma`, `@rumsan/settings`
- **AWS SDK** — S3 operations (`@aws-sdk/client-s3`)
- **Socket.io** — Real-time communications
- **Zod** — Schema validation
- **CSV Parser** — CSV import handling
- **XLSX** — Excel import/export
- **Ethers.js** — Blockchain/wallet interactions
- **Libphonenumber-js** — Phone number validation

## Configuration & Environment

### Core Environment Variables

**Ports & Service**

```
PORT=5505              # Main API port
PORT_BEN=5501          # (Legacy/reserved for beneficiary service)
```

**Database**

```
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
```

**Redis** (Job Queue)

```
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
```

**JWT**

```
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_TIME=604800000    # 7 days in ms
JWT_EXPIRATION_LONG_TIME=604800000
```

**OTP**

```
OTP_DURATION_IN_SECS=300
```

**S3/R2 File Storage**

```
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
(Set S3 bucket/endpoint in service config)
```

**SMTP** (Email)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME, SMTP_PASSWORD
```

**External Services**

```
KOBO_URL               # Kobo Toolbox API endpoint
AUTH_TOKEN             # API auth token
PRIVATE_KEY            # Blockchain private key
```

See `.env` (git-ignored) or `env.example` for full reference.

## Testing

- **Jest** for unit and E2E tests
- Test files: `*.spec.ts` for unit tests
- E2E tests in `apps/rahat-community-e2e/src/`
- Run suite: `pnpm test`
- Run single E2E test: `npx nx test rahat-community-e2e:e2e --testFile=<name>.e2e-spec.ts`

## Important Patterns & Conventions

1. **Modules per Feature** — Each major feature (beneficiaries, groups, targets) has its own module with controllers, services, and DTOs.

2. **DTO Pattern** — Use `class-validator` decorated DTOs in `*.dto.ts` files; `@nestjs/mapped-types` for Create/Update variants.

3. **Prisma Seeding** — Use scripts in `prisma/` directory (e.g., `seed.local.ts`). Run via `pnpm setup-data` or `npx prisma db seed`.

4. **Event Emitters** — For decoupled logic (e.g., on beneficiary creation, emit event for stats update). See `app/listeners/`.

5. **Job Processing** — Long-running operations (imports/exports) use Bull jobs in `app/processors/`.

6. **JSONB Extras Field** — Dynamic fields stored in `Beneficiary.extras` as JSONB. Always validate schema with Zod or similar before storing.

7. **Soft Deletes** — Beneficiaries are soft-deleted (archived) via `BeneficiaryArchive`; original record may remain in `Beneficiary` table.

8. **Audit Logging** — Track changes in `auditLog/` module; captured via interceptors or event listeners.

## SDK Publishing

The SDK (`libs/sdk`) is published to npm as `@rahataid/community-tool-sdk`. Version in `libs/sdk/package.json`. Clients exported:

- `getAppClient`, `getSettingsClient`, `getBeneficiaryClient`, `getGroupClient`, `getTargetClient`, etc.

Use cases are documented in `docs/apps.md`, `docs/beneficiary.md`, etc.

## Build & Deployment

- **Nx build** — Compiles TypeScript, bundles with Webpack (see `webpack.config.js`)
- **Output** — `dist/apps/rahat-community/` (contains compiled code + copied `prisma/` directory)
- **Prisma migrations** — Must run in deployed environment: `npx prisma migrate deploy`
- **Dockerfile** — `Dockerfile.rahat-community` for container deployment

## Pre-commit Hooks

Husky is configured for git hooks:

- **Pre-commit** — Prettier formats code and stages changes automatically
- Managed in `package.json` `husky.hooks`

## Notes for Contributors

- All API endpoints are under `/api/v1/` prefix
- Swagger docs available at `/api/docs` (auto-generated from NestJS decorators)
- Keep controller logic minimal; push business logic to services
- Use Prisma's relation loading (`.include()`, `.select()`) to avoid N+1 queries
- When adding new models: generate Prisma client after schema update (`pnpm prisma:generate`)
- For breaking DB changes: create new migration (`npx prisma migrate dev --name <description>`)

## Recent Feature Work

### Dynamic Unique Fields for Duplicate Detection (branch: `feature/dynamic-settings`)

**Requirement:** The UI can now pass one or more unique fields per import/validate call to control which fields are used for duplicate detection. If not provided, falls back to the global `UNIQUE_FIELDS` DB setting (existing behaviour preserved).

**Files changed:**

- `libs/extentions/src/dtos/source/create-source.dto.ts` — Added `uniqueFields?: string[]` field
- `libs/sdk/src/source/source.types.ts` — Added `uniqueFields?: string[]` to `Source` type
- `apps/rahat-community/src/app/sources/source.service.ts` — Added `resolveImportUniqueFields()` private method; wired into `create()`; persists `uniqueFields` in `fieldMapping` JSON column via `createSourceAndAddToQueue()`

**How it works:**

- UI sends `uniqueFields: ["phone", "email"]` in the POST `/api/v1/sources` body
- `resolveImportUniqueFields()` validates fields against `BENEF_UNIQUE_FIELDS` allowlist and returns them; if empty/absent, falls back to `getUniqueFieldSettings()` (reads from DB)
- Both VALIDATE and IMPORT actions use the resolved fields for schema validation and duplicate checking
- `uniqueFields` is stored in the source `fieldMapping` JSONB column for auditability

**Allowed unique field values:** `phone`, `email`, `govtIDNumber`, `walletAddress`, `koboId`, and any active secondary (extras) field name from `FieldDefinition`.

**UI contract:**

```json
POST /api/v1/sources
{
  "name": "Import Jan 2025",
  "action": "VALIDATE",
  "importId": "abc-123",
  "uniqueFields": ["phone", "email"],
  "fieldMapping": { "data": [...], "sourceTargetMappings": [...] }
}
```

Omit `uniqueFields` or send `[]` to use the global settings default. The `UNIQUE_FIELDS` DB setting is now optional — if absent, import proceeds with no duplicate detection.

---

### Force Insert — Skip All Validation (branch: `feature/dynamic-settings`)

**Requirement:** Ground data from the field often fails standard validation (missing country codes, non-standard phone lengths, duplicate `govtIDNumber`). A force-insert mode is needed to bypass all schema validation and push data directly into the import queue.

**Design decision:** `forceInsert` is a dedicated `boolean` field in `CreateSourceDto`. The UI sends it explicitly — it is not embedded in `uniqueFields`.

**How it works:**

- `CreateSourceDto` has `forceInsert?: boolean`.
- In `create()`, `dto.forceInsert` is read directly.
- If `forceInsert` is `true` and `action === IMPORT`, the `validateSchemaFields()` call is skipped entirely and data goes straight to `createSourceAndAddToQueue()`.
- The async COPY pipeline already has no validation — it accepts any string value.
- Phone sanitization (stripping non-digits) and UUID assignment still run regardless of `forceInsert`.
- `UNIQUE_FIELDS` setting is no longer required. If absent and no `uniqueFields` sent in payload, `getUniqueFieldSettings()` now returns `[]` instead of throwing, meaning no duplicate check runs.

**UI contract — force insert:**

```json
POST /api/v1/sources
{
  "name": "Import Jan 2025",
  "action": "IMPORT",
  "importId": "abc-123",
  "forceInsert": true,
  "fieldMapping": { "data": [...], "sourceTargetMappings": [...] }
}
```

To combine force insert with duplicate detection on a specific field:

```json
{
  "forceInsert": true,
  "uniqueFields": ["phone"]
}
```

**What is skipped vs always runs:**

| Step | Normal IMPORT | `forceInsert: true` |
|---|---|---|
| Phone E.164 format check | enforced | skipped |
| `uniqueFields` required check | enforced | skipped |
| Secondary field format/enum | enforced | skipped |
| Phone sanitization (strip non-digits) | always | always |
| UUID assignment | always | always |
| DB upsert ON CONFLICT (uuid) | always | always |

---

### Field Definitions — `listUnique` API (branch: `feature/dynamic-settings`)

**Requirement:** Expose an endpoint to list only field definitions marked as unique, so the UI and SDK can fetch which secondary fields are eligible for duplicate detection.

**Endpoint:** `GET /api/v1/field-definitions/unique`

**Files changed:**

- `apps/rahat-community/src/app/field-definitions/field-definitions.controller.ts` — Added `GET /unique` route
- `apps/rahat-community/src/app/field-definitions/field-definitions.service.ts` — Added `listUnique()` method (queries where `isUnique: true` and `isActive: true`)
- `libs/sdk/src/clients/fieldDefinition.client.ts` — Added `listUnique` client method
- `libs/sdk/src/types/fieldDefinition.client.types.ts` — Added `listUnique` to `FieldDefinitionClient` type

---

### Bug Fix — Latitude/Longitude Validation Failing on Valid Values (branch: `feature/dynamic-settings`)

**Problem:** Records with valid coordinates like `27.6808779752913` were rejected as invalid during import.

**Root cause:** `LatitudeConstraint` and `LongitudeConstraint` check `typeof value !== 'number'`. Values from CSV/Excel arrive as strings after field mapping. `plainToInstance` does not coerce string → number without an explicit decorator.

**Fix:** Added `@Type(() => Number)` from `class-transformer` to `latitude` and `longitude` in `libs/extentions/src/dtos/beneficiary/create-beneficiary.dto.ts`.

---

### Validate Response — 500 Record Preview Limit (branch: `feature/dynamic-settings`)

**Problem:** Validating 10,000 records returned the full dataset in a single response, causing the browser to become unresponsive.

**Fix:** VALIDATE response is capped at 500 records/errors. A `summary` object is always returned with full aggregate counts.

```json
{
  "summary": {
    "total": 10000,
    "invalidCount": 9500,
    "duplicateCount": 120,
    "previewLimit": 500
  },
  "invalidFields": [...],
  "result": [...],
  "hasUUID": false
}
```

The `IMPORT` action is unaffected — all records are always imported.

**File changed:** `apps/rahat-community/src/app/sources/source.service.ts` — `PREVIEW_LIMIT = 500` constant in `ValidateBeneficiaryImort()`.
