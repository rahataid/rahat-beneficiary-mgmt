-- CreateTable
CREATE TABLE "tbl_target_result" (
    "id" SERIAL NOT NULL,
    "benf_uuid" UUID NOT NULL,
    "target_uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_target_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tbl_target_result_target_uuid_idx" ON "tbl_target_result"("target_uuid");

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_benf_uuid_fkey" FOREIGN KEY ("benf_uuid") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_target_uuid_fkey" FOREIGN KEY ("target_uuid") REFERENCES "tbl_target_query"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
