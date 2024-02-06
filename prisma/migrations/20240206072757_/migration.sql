/*
  Warnings:

  - You are about to drop the column `created_at` on the `tbl_target_query` table. All the data in the column will be lost.
  - You are about to drop the column `extras` on the `tbl_target_query` table. All the data in the column will be lost.
  - You are about to drop the column `query` on the `tbl_target_query` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tbl_target_query` table. All the data in the column will be lost.
  - Added the required column `filterOptions` to the `tbl_target_query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_target_query" DROP COLUMN "created_at",
DROP COLUMN "extras",
DROP COLUMN "query",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filterOptions" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
