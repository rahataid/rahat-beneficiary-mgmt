-- CreateEnum
CREATE TYPE "TargetQueryStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BankedStatus" AS ENUM ('UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED');

-- CreateEnum
CREATE TYPE "InternetStatus" AS ENUM ('UNKNOWN', 'NO_INTERNET', 'HOME_INTERNET', 'MOBILE_INTERNET');

-- CreateEnum
CREATE TYPE "PhoneStatus" AS ENUM ('UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('EMAIL', 'PHONE', 'WALLET');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('CHECKBOX', 'DROPDOWN', 'NUMBER', 'PASSWORD', 'RADIO', 'TEXT', 'TEXTAREA');

-- CreateTable
CREATE TABLE "tbl_beneficiaries" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "customId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "walletAddress" TEXT,
    "birthDate" TIMESTAMP(3),
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "extras" JSONB,
    "notes" TEXT,
    "bankedStatus" "BankedStatus" NOT NULL DEFAULT 'UNKNOWN',
    "internetStatus" "InternetStatus" NOT NULL DEFAULT 'UNKNOWN',
    "phoneStatus" "PhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_sources" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB NOT NULL,
    "fieldMapping" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_beneficiary_sources" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiary_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_field_definitions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "fieldPopulate" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_beneficiary_groups" (
    "id" SERIAL NOT NULL,
    "beneficiaryId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiary_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_target_queries" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "label" TEXT,
    "filterOptions" JSONB NOT NULL,
    "status" "TargetQueryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_target_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_target_results" (
    "id" SERIAL NOT NULL,
    "benefUuid" UUID NOT NULL,
    "targetUuid" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_target_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "action" VARCHAR NOT NULL,
    "subject" VARCHAR NOT NULL,
    "inverted" BOOLEAN NOT NULL DEFAULT false,
    "conditions" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authAddress" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL DEFAULT 'EMAIL',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "otp" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "requiredFields" TEXT[],
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_uuid_key" ON "tbl_beneficiaries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_customId_key" ON "tbl_beneficiaries"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_sources_uuid_key" ON "tbl_sources"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_field_definitions_name_key" ON "tbl_field_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_groups_name_key" ON "tbl_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_groups_beneficiaryId_groupId_key" ON "tbl_beneficiary_groups"("beneficiaryId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_target_queries_uuid_key" ON "tbl_target_queries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_authAddress_key" ON "users"("authAddress");

-- CreateIndex
CREATE UNIQUE INDEX "settings_name_key" ON "settings"("name");

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_sources" ADD CONSTRAINT "tbl_beneficiary_sources_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "tbl_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_sources" ADD CONSTRAINT "tbl_beneficiary_sources_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_groups" ADD CONSTRAINT "tbl_beneficiary_groups_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiary_groups" ADD CONSTRAINT "tbl_beneficiary_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "tbl_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_results" ADD CONSTRAINT "tbl_target_results_benefUuid_fkey" FOREIGN KEY ("benefUuid") REFERENCES "tbl_beneficiaries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_results" ADD CONSTRAINT "tbl_target_results_targetUuid_fkey" FOREIGN KEY ("targetUuid") REFERENCES "tbl_target_queries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
