/*
  Warnings:

  - You are about to drop the column `udpatedAt` on the `tbl_archive_beneficiaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_archive_beneficiaries" DROP COLUMN "udpatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3);
