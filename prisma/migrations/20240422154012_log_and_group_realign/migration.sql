/*
  Warnings:

  - You are about to drop the column `customId` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[govtIDNumber]` on the table `tbl_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - Made the column `govtIDNumber` on table `tbl_beneficiaries` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ArchiveType" AS ENUM ('DELETED', 'UPDATED');

-- DropIndex
DROP INDEX "tbl_beneficiaries_customId_key";

-- AlterTable
ALTER TABLE "tbl_beneficiaries" DROP COLUMN "customId",
ALTER COLUMN "govtIDNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "tbl_groups" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tbl_archive_beneficiaries" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "govtIDNumber" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "walletAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,
    "bankedStatus" "BankedStatus" NOT NULL DEFAULT 'UNKNOWN',
    "internetStatus" "InternetStatus" NOT NULL DEFAULT 'UNKNOWN',
    "phoneStatus" "PhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "archiveType" "ArchiveType" NOT NULL DEFAULT 'DELETED',

    CONSTRAINT "tbl_archive_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_archive_beneficiaries_uuid_key" ON "tbl_archive_beneficiaries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_govtIDNumber_key" ON "tbl_beneficiaries"("govtIDNumber");
