-- CreateTable
CREATE TABLE "tbl_logs" (
    "id" INTEGER NOT NULL,
    "uuid" UUID NOT NULL,
    "userUUID" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_logs_id_key" ON "tbl_logs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_logs_uuid_key" ON "tbl_logs"("uuid");

-- AddForeignKey
ALTER TABLE "tbl_logs" ADD CONSTRAINT "tbl_logs_userUUID_fkey" FOREIGN KEY ("userUUID") REFERENCES "tbl_users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
