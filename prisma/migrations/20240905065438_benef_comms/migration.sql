-- CreateTable
CREATE TABLE "tbl_beneficiary_comms" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "groupUID" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "transportId" TEXT NOT NULL,
    "sessionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "tbl_beneficiary_comms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_comms_uuid_key" ON "tbl_beneficiary_comms"("uuid");

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_comms" ADD CONSTRAINT "tbl_beneficiary_comms_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "tbl_users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_comms" ADD CONSTRAINT "tbl_beneficiary_comms_groupUID_fkey" FOREIGN KEY ("groupUID") REFERENCES "tbl_groups"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
