/*
  Warnings:

  - Changed the type of `benef_id` on the `tbl_target_result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "tbl_target_result" DROP CONSTRAINT "tbl_target_result_benef_id_fkey";

-- AlterTable
ALTER TABLE "tbl_target_result" DROP COLUMN "benef_id",
ADD COLUMN     "benef_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_benef_id_fkey" FOREIGN KEY ("benef_id") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
