/*
  Warnings:

  - You are about to drop the column `udpateAt` on the `tbl_archive_beneficiaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_archive_beneficiaries" DROP COLUMN "udpateAt",
ADD COLUMN     "udpatedAt" TIMESTAMP(3);
