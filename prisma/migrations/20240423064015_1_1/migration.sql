/*
  Warnings:

  - You are about to drop the column `beneficiaryId` on the `tbl_beneficiary_sources` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `tbl_beneficiary_sources` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `tbl_beneficiary_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `tbl_beneficiary_sources` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[beneficiaryUID,sourceUID]` on the table `tbl_beneficiary_sources` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `tbl_field_definitions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `tbl_target_results` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `tbl_beneficiary_groups` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `beneficiaryUID` to the `tbl_beneficiary_sources` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUID` to the `tbl_beneficiary_sources` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `tbl_beneficiary_sources` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `tbl_field_definitions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `tbl_target_results` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "tbl_beneficiary_sources" DROP CONSTRAINT "tbl_beneficiary_sources_beneficiaryId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_beneficiary_sources" DROP CONSTRAINT "tbl_beneficiary_sources_sourceId_fkey";

-- AlterTable
ALTER TABLE "tbl_beneficiary_groups" ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tbl_beneficiary_sources" DROP COLUMN "beneficiaryId",
DROP COLUMN "sourceId",
ADD COLUMN     "beneficiaryUID" UUID NOT NULL,
ADD COLUMN     "sourceUID" UUID NOT NULL,
ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tbl_field_definitions" ADD COLUMN     "uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tbl_target_results" ADD COLUMN     "uuid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_groups_uuid_key" ON "tbl_beneficiary_groups"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_sources_uuid_key" ON "tbl_beneficiary_sources"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_sources_beneficiaryUID_sourceUID_key" ON "tbl_beneficiary_sources"("beneficiaryUID", "sourceUID");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_field_definitions_uuid_key" ON "tbl_field_definitions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_target_results_uuid_key" ON "tbl_target_results"("uuid");

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_sources" ADD CONSTRAINT "tbl_beneficiary_sources_sourceUID_fkey" FOREIGN KEY ("sourceUID") REFERENCES "tbl_sources"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_sources" ADD CONSTRAINT "tbl_beneficiary_sources_beneficiaryUID_fkey" FOREIGN KEY ("beneficiaryUID") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
