-- CreateEnum
CREATE TYPE "TargetQueryStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "tbl_target_query" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "label" TEXT,
    "query_filters" JSONB NOT NULL,
    "extras_filters" JSONB NOT NULL,
    "status" "TargetQueryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_target_query_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_target_query_uuid_key" ON "tbl_target_query"("uuid");
