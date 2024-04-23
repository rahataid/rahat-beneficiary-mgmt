/*
  Warnings:

  - You are about to drop the column `details` on the `tbl_sources` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueField` on the `tbl_sources` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ImportField" AS ENUM ('UUID', 'GOVT_ID_NUMBER');

-- AlterTable
ALTER TABLE "tbl_sources" DROP COLUMN "details",
DROP COLUMN "uniqueField",
ADD COLUMN     "importField" "ImportField" NOT NULL DEFAULT 'UUID';
