-- CreateTable
CREATE TABLE "tbl_user_agreements" (
    "userId" TEXT NOT NULL,
    "agreedTOS" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_agreements_userId_key" ON "tbl_user_agreements"("userId");

-- AddForeignKey
ALTER TABLE "tbl_user_agreements" ADD CONSTRAINT "tbl_user_agreements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbl_users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
