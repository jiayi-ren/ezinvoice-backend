exports.up = async function (knex) {
    await knex.raw(`ALTER TABLE invoice_items DROP CONSTRAINT invoice_items_item_id_foreign;
  ALTER TABLE invoice_items ALTER COLUMN item_id TYPE VARCHAR;
  ALTER TABLE estimate_items DROP CONSTRAINT estimate_items_item_id_foreign;
  ALTER TABLE estimate_items ALTER COLUMN item_id TYPE VARCHAR;
  ALTER TABLE items ALTER COLUMN id TYPE VARCHAR;
  ALTER TABLE items ALTER COLUMN id SET DEFAULT 0;
  ALTER TABLE estimate_items ADD CONSTRAINT estimate_items_item_id_foreign
  FOREIGN KEY (item_id) REFERENCES items(id);
  ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_item_id_foreign
  FOREIGN KEY (item_id) REFERENCES items(id);`);

    return await knex.schema.table('items', function (table) {
        table.boolean('is_hidden').defaultTo(true);
    });
};

exports.down = async function (knex) {
    await knex.raw(`ALTER TABLE invoice_items DROP CONSTRAINT invoice_items_item_id_foreign;
    ALTER TABLE invoice_items ALTER COLUMN item_id TYPE BIGINT USING item_id::bigint;
    ALTER TABLE estimate_items DROP CONSTRAINT estimate_items_item_id_foreign;
    ALTER TABLE estimate_items ALTER COLUMN item_id TYPE BIGINT USING item_id::bigint;
    ALTER TABLE items ALTER COLUMN id TYPE BIGINT USING id::bigint;
    ALTER TABLE items ALTER COLUMN id SET DEFAULT nextval('items_id_seq'::regclass);
    ALTER TABLE estimate_items ADD CONSTRAINT estimate_items_item_id_foreign
    FOREIGN KEY (item_id) REFERENCES items(id);
    ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_item_id_foreign
    FOREIGN KEY (item_id) REFERENCES items(id);`);

    return await knex.schema.table('items', function (table) {
        table.dropColumn('is_hidden');
    });
};
