-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('Checkbox', 'Dropdown', 'Number', 'Password', 'Radio', 'Text', 'Textarea');

-- AlterTable
ALTER TABLE "tbl_field_definition" ADD COLUMN     "field_populate" JSONB;
