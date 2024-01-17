-- DropForeignKey
ALTER TABLE "tbl_beneficiaries" DROP CONSTRAINT "tbl_beneficiaries_sourceId_fkey";

-- AlterTable
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "sourceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_beneficiaries" ADD CONSTRAINT "tbl_beneficiaries_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "tbl_beneficiary_source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
