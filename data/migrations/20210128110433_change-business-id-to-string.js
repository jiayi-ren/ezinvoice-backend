exports.up = async function (knex) {
    return await knex.raw(`ALTER TABLE invoices DROP CONSTRAINT invoices_business_id_foreign;
  ALTER TABLE invoices ALTER COLUMN business_id TYPE VARCHAR;
  ALTER TABLE estimates DROP CONSTRAINT estimates_business_id_foreign;
  ALTER TABLE estimates ALTER COLUMN business_id TYPE VARCHAR;
  ALTER TABLE businesses ALTER COLUMN id TYPE VARCHAR;
  ALTER TABLE businesses ALTER COLUMN id SET DEFAULT 0;
  ALTER TABLE estimates ADD CONSTRAINT estimates_business_id_foreign
  FOREIGN KEY (business_id) REFERENCES businesses(id);
  ALTER TABLE invoices ADD CONSTRAINT invoices_business_id_foreign
  FOREIGN KEY (business_id) REFERENCES businesses(id);`);
};

exports.down = async function (knex) {
    return await knex.raw(`ALTER TABLE invoices DROP CONSTRAINT invoices_business_id_foreign;
  ALTER TABLE invoices ALTER COLUMN business_id TYPE BIGINT USING business_id::bigint;
  ALTER TABLE estimates DROP CONSTRAINT estimates_business_id_foreign;
  ALTER TABLE estimates ALTER COLUMN business_id TYPE BIGINT USING business_id::bigint;
  ALTER TABLE businesses ALTER COLUMN id TYPE BIGINT USING id::bigint;
  ALTER TABLE businesses ALTER COLUMN id SET DEFAULT nextval('businesses_id_seq'::regclass);
  ALTER TABLE estimates ADD CONSTRAINT estimates_business_id_foreign
  FOREIGN KEY (business_id) REFERENCES businesses(id);
  ALTER TABLE invoices ADD CONSTRAINT invoices_business_id_foreign
  FOREIGN KEY (business_id) REFERENCES businesses(id);`);
};
