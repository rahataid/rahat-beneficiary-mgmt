/*
  Warnings:

  - You are about to drop the column `benef_id` on the `tbl_target_result` table. All the data in the column will be lost.
  - Added the required column `benef_uuid` to the `tbl_target_result` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_target_result" DROP CONSTRAINT "tbl_target_result_benef_id_fkey";

-- AlterTable
ALTER TABLE "tbl_target_result" DROP COLUMN "benef_id",
ADD COLUMN     "benef_uuid" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_benef_uuid_fkey" FOREIGN KEY ("benef_uuid") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
