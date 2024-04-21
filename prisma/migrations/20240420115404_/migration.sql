-- DropIndex
DROP INDEX "tbl_logs_id_key";

-- AlterTable
CREATE SEQUENCE tbl_logs_id_seq;
ALTER TABLE "tbl_logs" ALTER COLUMN "id" SET DEFAULT nextval('tbl_logs_id_seq');
ALTER SEQUENCE tbl_logs_id_seq OWNED BY "tbl_logs"."id";
