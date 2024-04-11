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

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('EMAIL', 'PHONE', 'WALLET', 'GOOGLE', 'APPLE', 'FACEBOOK', 'TWITTER', 'GITHUB', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "SignupStatus" AS ENUM ('PENDING', 'APPROVED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'OBJECT');

-- CreateTable
CREATE TABLE "tbl_beneficiaries" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "customId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "walletAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isVulnerable" BOOLEAN NOT NULL DEFAULT false,
    "govtIDType" TEXT,
    "govtIDNumber" TEXT,
    "govtIDPhoto" TEXT,
    "notes" TEXT,
    "bankedStatus" "BankedStatus" NOT NULL DEFAULT 'UNKNOWN',
    "internetStatus" "InternetStatus" NOT NULL DEFAULT 'UNKNOWN',
    "phoneStatus" "PhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "extras" JSONB,

    CONSTRAINT "tbl_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_sources" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "uniqueField" TEXT,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB,
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
    "isTargeting" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_groups" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
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
CREATE TABLE "tbl_users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "email" TEXT,
    "phone" TEXT,
    "wallet" TEXT,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_auth_roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" INTEGER,
    "updatedBy" INTEGER
);

-- CreateTable
CREATE TABLE "tbl_auth_permissions" (
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
CREATE TABLE "tbl_users_roles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "tbl_users_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_auth" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "service" "Service" NOT NULL,
    "serviceId" TEXT NOT NULL,
    "details" JSONB,
    "challenge" TEXT,
    "falseAttempts" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedOnAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_auth_sessions" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authId" INTEGER NOT NULL,
    "ip" TEXT,
    "details" JSONB,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_users_signups" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userIdentifier" TEXT,
    "data" JSONB,
    "status" "SignupStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_users_signups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_settings" (
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "dataType" "SettingDataType" NOT NULL,
    "requiredFields" TEXT[],
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbl_settings_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_uuid_key" ON "tbl_beneficiaries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiaries_customId_key" ON "tbl_beneficiaries"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_sources_uuid_key" ON "tbl_sources"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_sources_importId_key" ON "tbl_sources"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_field_definitions_name_key" ON "tbl_field_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_groups_uuid_key" ON "tbl_groups"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_groups_name_key" ON "tbl_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_beneficiary_groups_beneficiaryId_groupId_key" ON "tbl_beneficiary_groups"("beneficiaryId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_target_queries_uuid_key" ON "tbl_target_queries"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_uuid_key" ON "tbl_users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_roles_id_key" ON "tbl_auth_roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_roles_name_key" ON "tbl_auth_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_permissions_id_key" ON "tbl_auth_permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_roles_userId_roleId_key" ON "tbl_users_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_service_serviceId_key" ON "tbl_auth"("service", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_auth_sessions_sessionId_key" ON "tbl_auth_sessions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_signups_uuid_key" ON "tbl_users_signups"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_settings_name_key" ON "tbl_settings"("name");

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
ALTER TABLE "tbl_auth_permissions" ADD CONSTRAINT "tbl_auth_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tbl_auth_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users_roles" ADD CONSTRAINT "tbl_users_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users_roles" ADD CONSTRAINT "tbl_users_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "tbl_auth_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_auth" ADD CONSTRAINT "tbl_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_auth_sessions" ADD CONSTRAINT "tbl_auth_sessions_authId_fkey" FOREIGN KEY ("authId") REFERENCES "tbl_auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users_signups" ADD CONSTRAINT "tbl_users_signups_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
