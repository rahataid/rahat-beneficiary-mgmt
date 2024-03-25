/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `tbl_groups` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `tbl_groups` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "tbl_groups" ADD COLUMN     "uuid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_groups_uuid_key" ON "tbl_groups"("uuid");