-- DropIndex
DROP INDEX "tbl_beneficiaries_govtIDNumber_key";

-- AlterTable
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "govtIDNumber" DROP NOT NULL;
