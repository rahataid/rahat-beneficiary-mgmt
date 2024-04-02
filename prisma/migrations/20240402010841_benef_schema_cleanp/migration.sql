/*
  Warnings:

  - You are about to drop the column `beneficiaryCast` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `isVulnerableMember` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `qualification` on the `tbl_beneficiaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_beneficiaries" DROP COLUMN "beneficiaryCast",
DROP COLUMN "isVulnerableMember",
DROP COLUMN "qualification",
ADD COLUMN     "isVulnerable" BOOLEAN NOT NULL DEFAULT false;
