/*
  Warnings:

  - You are about to drop the column `customUniqueField` on the `tbl_sources` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbl_sources" DROP COLUMN "customUniqueField",
ADD COLUMN     "uniqueField" TEXT;
