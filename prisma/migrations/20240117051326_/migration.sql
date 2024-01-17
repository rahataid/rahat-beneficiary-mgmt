/*
  Warnings:

  - A unique constraint covering the columns `[beneficary_id,group_id]` on the table `tbl_beneficiariesgroups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiariesgroups_beneficary_id_group_id_key" ON "tbl_beneficiariesgroups"("beneficary_id", "group_id");
