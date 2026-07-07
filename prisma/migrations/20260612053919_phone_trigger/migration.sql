
-- Create sequence
CREATE SEQUENCE IF NOT EXISTS "tbl_beneficiaries_derived_phone_seq";

-- Create trigger function
CREATE OR REPLACE FUNCTION generate_derived_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."phone" IS NULL OR TRIM(NEW."phone") = '' THEN
    NEW."phone" :=
      '+000888' ||
      LPAD(
        nextval('tbl_beneficiaries_derived_phone_seq')::text,
        7,
        '0'
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Avoid duplicate trigger creation
DROP TRIGGER IF EXISTS trg_generate_derived_phone
ON "tbl_beneficiaries";

CREATE TRIGGER trg_generate_derived_phone
BEFORE INSERT ON "tbl_beneficiaries"
FOR EACH ROW
EXECUTE FUNCTION generate_derived_phone();