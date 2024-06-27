-- AlterTable
ALTER TABLE "tbl_field_definitions" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "variations" TEXT[];

-- AlterTable
ALTER TABLE "tbl_groups" ADD COLUMN     "origins" TEXT[];
