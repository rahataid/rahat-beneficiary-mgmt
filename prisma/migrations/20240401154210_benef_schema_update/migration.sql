-- AlterTable
ALTER TABLE "tbl_beneficiaries" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "beneficiaryCast" TEXT,
ADD COLUMN     "govtIDNumber" TEXT,
ADD COLUMN     "govtIDPhoto" TEXT,
ADD COLUMN     "govtIDType" TEXT,
ADD COLUMN     "isVulnerableMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qualification" TEXT;
