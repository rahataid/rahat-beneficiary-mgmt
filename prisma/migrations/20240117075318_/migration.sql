/*
  Warnings:

  - You are about to drop the column `sourceId` on the `tbl_beneficiaries` table. All the data in the column will be lost.
  - You are about to drop the `tbl_beneficiary_source` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbl_beneficiaries" DROP CONSTRAINT "tbl_beneficiaries_sourceId_fkey";

-- AlterTable
ALTER TABLE "tbl_beneficiaries" DROP COLUMN "sourceId";

-- DropTable
DROP TABLE "tbl_beneficiary_source";

-- CreateTable
CREATE TABLE "tbl_source" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "field_mapping" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_beneficiariessource" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "beneficiary_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiariessource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_source_uuid_key" ON "tbl_source"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiariessource_beneficiary_id_source_id_key" ON "tbl_beneficiariessource"("beneficiary_id", "source_id");

-- AddForeignKey
ALTER TABLE "tbl_beneficiariessource" ADD CONSTRAINT "tbl_beneficiariessource_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "tbl_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiariessource" ADD CONSTRAINT "tbl_beneficiariessource_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
