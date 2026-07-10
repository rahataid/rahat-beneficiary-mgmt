-- AlterTable
ALTER TABLE "tbl_archive_beneficiaries" ADD COLUMN     "koboId" TEXT;

-- AlterTable
ALTER TABLE "tbl_beneficiaries" ADD COLUMN     "koboId" TEXT;

-- AlterTable
ALTER TABLE "tbl_beneficiary_staging" ADD COLUMN     "koboId" TEXT;

-- CreateIndex
CREATE INDEX "tbl_beneficiaries_koboId_idx" ON "tbl_beneficiaries"("koboId");
