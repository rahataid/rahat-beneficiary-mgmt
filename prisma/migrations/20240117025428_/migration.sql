/*
  Warnings:

  - The values [Others] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `birthDate` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `importId` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the column `rawData` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[custom_id]` on the table `tbl_beneficiaries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `custom_id` to the `tbl_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `tbl_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `tbl_beneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceId` to the `tbl_beneficiaries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankedStatus" AS ENUM ('UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED');

-- CreateEnum
CREATE TYPE "InternetStatus" AS ENUM ('UNKNOWN', 'NO_INTERNET', 'HOME_INTERNET', 'MOBILE_INTERNET');

-- CreateEnum
CREATE TYPE "PhoneStatus" AS ENUM ('UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE');

-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('Male', 'Female', 'Other', 'Unknown');
ALTER TABLE "tbl_beneficiaries" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "tbl_beneficiaries" DROP COLUMN "birthDate",
DROP COLUMN "firstName",
DROP COLUMN "importId",
DROP COLUMN "lastName",
DROP COLUMN "rawData",
ADD COLUMN     "banked_status" "BankedStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "custom_id" UUID NOT NULL,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "internet_status" "InternetStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone_status" "PhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "sourceId" INTEGER NOT NULL,
ADD COLUMN     "wallet_address" TEXT,
ALTER COLUMN "gender" SET DEFAULT 'Unknown';

-- CreateTable
CREATE TABLE "tbl_beneficiary_source" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "field_mapping" JSONB NOT NULL,

    CONSTRAINT "tbl_beneficiary_source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_source_uuid_key" ON "tbl_beneficiary_source"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_custom_id_key" ON "tbl_beneficiaries"("custom_id");

-- AddForeignKey
ALTER TABLE "tbl_beneficiaries" ADD CONSTRAINT "tbl_beneficiaries_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "tbl_beneficiary_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
