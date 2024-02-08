/*
  Warnings:

  - You are about to drop the column `beneficaryId` on the `tbl_beneficiary_groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[beneficiaryId,groupId]` on the table `tbl_beneficiary_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `beneficiaryId` to the `tbl_beneficiary_groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_beneficiary_groups" DROP CONSTRAINT "tbl_beneficiary_groups_beneficaryId_fkey";

-- DropIndex
DROP INDEX "tbl_beneficiary_groups_beneficaryId_groupId_key";

-- AlterTable
ALTER TABLE "tbl_beneficiary_groups" DROP COLUMN "beneficaryId",
ADD COLUMN     "beneficiaryId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_groups_beneficiaryId_groupId_key" ON "tbl_beneficiary_groups"("beneficiaryId", "groupId");

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_groups" ADD CONSTRAINT "tbl_beneficiary_groups_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
