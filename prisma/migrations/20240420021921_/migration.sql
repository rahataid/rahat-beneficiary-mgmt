/*
  Warnings:

  - You are about to drop the column `govtIDPhoto` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `govtIDType` on the `tbl_beneficiaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_beneficiaries" DROP COLUMN "govtIDPhoto",
DROP COLUMN "govtIDType";
