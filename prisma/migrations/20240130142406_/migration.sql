/*
  Warnings:

  - You are about to drop the column `extras_filters` on the `tbl_target_query` table. All the data in the column will be lost.
  - You are about to drop the column `query_filters` on the `tbl_target_query` table. All the data in the column will be lost.
  - Added the required column `extras` to the `tbl_target_query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `tbl_target_query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_target_query" DROP COLUMN "extras_filters",
DROP COLUMN "query_filters",
ADD COLUMN     "extras" JSONB NOT NULL,
ADD COLUMN     "query" JSONB NOT NULL;
