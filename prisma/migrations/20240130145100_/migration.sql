-- DropForeignKey
ALTER TABLE "tbl_target_result" DROP CONSTRAINT "tbl_target_result_benf_uuid_fkey";

-- DropForeignKey
ALTER TABLE "tbl_target_result" DROP CONSTRAINT "tbl_target_result_target_uuid_fkey";

-- AlterTable
ALTER TABLE "tbl_target_result" ALTER COLUMN "benf_uuid" SET DATA TYPE TEXT,
ALTER COLUMN "target_uuid" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_benf_uuid_fkey" FOREIGN KEY ("benf_uuid") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_target_uuid_fkey" FOREIGN KEY ("target_uuid") REFERENCES "tbl_target_query"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
