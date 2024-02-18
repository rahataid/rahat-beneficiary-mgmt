/*
  Warnings:

  - A unique constraint covering the columns `[importId]` on the table `tbl_sources` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `importId` to the `tbl_sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_sources" ADD COLUMN     "importId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_sources_importId_key" ON "tbl_sources"("importId");
