/*
  Warnings:

  - You are about to drop the column `userUUID` on the `tbl_logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbl_logs" DROP CONSTRAINT "tbl_logs_userUUID_fkey";

-- AlterTable
ALTER TABLE "tbl_logs" DROP COLUMN "userUUID",
ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "tbl_logs" ADD CONSTRAINT "tbl_logs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
