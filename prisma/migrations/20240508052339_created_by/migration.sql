-- AlterTable
ALTER TABLE "tbl_beneficiaries" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "tbl_field_definitions" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "tbl_groups" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "tbl_sources" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "tbl_target_queries" ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "tbl_beneficiaries" ADD CONSTRAINT "tbl_beneficiaries_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_sources" ADD CONSTRAINT "tbl_sources_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_field_definitions" ADD CONSTRAINT "tbl_field_definitions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_groups" ADD CONSTRAINT "tbl_groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_queries" ADD CONSTRAINT "tbl_target_queries_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
