/*
  Warnings:

  - Changed the type of `field_type` on the `tbl_field_definition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tbl_field_definition" DROP COLUMN "field_type",
ADD COLUMN     "field_type" "FieldType" NOT NULL;
