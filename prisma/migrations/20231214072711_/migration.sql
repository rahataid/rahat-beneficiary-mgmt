-- CreateEnum
CREATE TYPE "TxnsStatus" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "tbl_communities" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "country" TEXT NOT NULL,
    "district" TEXT,
    "fundRaisedUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "fundRaisedLocal" TEXT NOT NULL DEFAULT '0',
    "localCurrency" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "managers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_communityManagers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "walletAddress" TEXT,
    "communities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_communityManagers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_communityDemographics" (
    "id" SERIAL NOT NULL,
    "communityId" INTEGER NOT NULL,
    "total_beneficiaries" INTEGER NOT NULL DEFAULT 0,
    "gender_male" INTEGER,
    "gender_female" INTEGER,
    "gender_other" INTEGER,
    "bank_yes" INTEGER,
    "bank_no" INTEGER,
    "internet_yes" INTEGER,
    "internet_no" INTEGER,
    "extras" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_communityDemographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_communities_address_key" ON "tbl_communities"("address");

-- AddForeignKey
ALTER TABLE "tbl_communities" ADD CONSTRAINT "tbl_communities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tbl_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_communityDemographics" ADD CONSTRAINT "tbl_communityDemographics_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "tbl_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
