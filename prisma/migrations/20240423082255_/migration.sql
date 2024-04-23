/*
  Warnings:

  - The primary key for the `tbl_archive_beneficiaries` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "tbl_archive_beneficiaries" DROP CONSTRAINT "tbl_archive_beneficiaries_pkey";
