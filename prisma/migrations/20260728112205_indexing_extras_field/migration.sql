-- CreateIndex
CREATE INDEX "tbl_beneficiaries_extras_idx" ON "tbl_beneficiaries" USING GIN ("extras" jsonb_path_ops);
