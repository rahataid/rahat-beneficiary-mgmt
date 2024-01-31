-- CreateEnum
CREATE TYPE "TargetQueryStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BankedStatus" AS ENUM ('UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED');

-- CreateEnum
CREATE TYPE "InternetStatus" AS ENUM ('UNKNOWN', 'NO_INTERNET', 'HOME_INTERNET', 'MOBILE_INTERNET');

-- CreateEnum
CREATE TYPE "PhoneStatus" AS ENUM ('UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other', 'Unknown');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Email', 'Phone', 'Wallet');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('Checkbox', 'Dropdown', 'Number', 'Password', 'Radio', 'Text', 'Textarea');

-- CreateTable
CREATE TABLE "tbl_beneficiaries" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "custom_id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'Unknown',
    "wallet_address" TEXT,
    "birth_date" TIMESTAMP(3),
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "extras" JSONB,
    "notes" TEXT,
    "banked_status" "BankedStatus" NOT NULL DEFAULT 'UNKNOWN',
    "internet_status" "InternetStatus" NOT NULL DEFAULT 'UNKNOWN',
    "phone_status" "PhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_source" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB NOT NULL,
    "field_mapping" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_beneficiariessource" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "beneficiary_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiariessource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_field_definition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "field_populate" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_field_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_beneficiariesgroups" (
    "id" SERIAL NOT NULL,
    "beneficary_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_beneficiariesgroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_target_query" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "label" TEXT,
    "query" JSONB NOT NULL,
    "extras" JSONB NOT NULL,
    "status" "TargetQueryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_target_query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_target_result" (
    "id" SERIAL NOT NULL,
    "benef_id" INTEGER NOT NULL,
    "target_uuid" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tbl_target_result_pkey" PRIMARY KEY ("id")
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
    "authType" "AuthType" NOT NULL DEFAULT 'Email',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "otp" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_uuid_key" ON "tbl_beneficiaries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_custom_id_key" ON "tbl_beneficiaries"("custom_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_source_uuid_key" ON "tbl_source"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_field_definition_name_key" ON "tbl_field_definition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_groups_name_key" ON "tbl_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiariesgroups_beneficary_id_group_id_key" ON "tbl_beneficiariesgroups"("beneficary_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_target_query_uuid_key" ON "tbl_target_query"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_authAddress_key" ON "users"("authAddress");

-- AddForeignKey
ALTER TABLE "tbl_beneficiariessource" ADD CONSTRAINT "tbl_beneficiariessource_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "tbl_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiariessource" ADD CONSTRAINT "tbl_beneficiariessource_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiariesgroups" ADD CONSTRAINT "tbl_beneficiariesgroups_beneficary_id_fkey" FOREIGN KEY ("beneficary_id") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_beneficiariesgroups" ADD CONSTRAINT "tbl_beneficiariesgroups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tbl_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_benef_id_fkey" FOREIGN KEY ("benef_id") REFERENCES "tbl_beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_target_result" ADD CONSTRAINT "tbl_target_result_target_uuid_fkey" FOREIGN KEY ("target_uuid") REFERENCES "tbl_target_query"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
