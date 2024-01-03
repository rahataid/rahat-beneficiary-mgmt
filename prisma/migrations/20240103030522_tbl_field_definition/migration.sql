-- CreateTable
CREATE TABLE "tbl_field_definition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbl_field_definition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_field_definition_name_key" ON "tbl_field_definition"("name");
