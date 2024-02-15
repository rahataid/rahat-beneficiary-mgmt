/*
  Warnings:

  - The values [Male,Female,Other,Unknown] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "gender" DROP DEFAULT;
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "gender" SET DEFAULT 'UNKNOWN';
COMMIT;

-- AlterTable
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "gender" SET DEFAULT 'UNKNOWN';
