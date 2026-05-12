-- AlterTable
ALTER TABLE "tbl_sources" ADD COLUMN     "importProgress" JSONB,
ADD COLUMN     "stagedFileKey" TEXT;

-- Staging table for bulk import pipeline (truncated per import job, not Prisma-managed)
CREATE TABLE IF NOT EXISTS "tbl_beneficiary_staging" (
  "uuid"            TEXT NOT NULL,
  "firstName"       TEXT,
  "lastName"        TEXT,
  "phone"           TEXT,
  "email"           TEXT,
  "govtIDNumber"    TEXT,
  "gender"          TEXT,
  "birthDate"       TEXT,
  "walletAddress"   TEXT,
  "location"        TEXT,
  "latitude"        TEXT,
  "longitude"       TEXT,
  "notes"           TEXT,
  "bankedStatus"    TEXT,
  "internetStatus"  TEXT,
  "phoneStatus"     TEXT,
  "extras"          TEXT,
  "createdBy"       TEXT
);
