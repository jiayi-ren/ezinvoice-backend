exports.up = async function (knex) {
    return await knex.raw(`ALTER TABLE invoices DROP CONSTRAINT invoices_client_id_foreign;
    ALTER TABLE invoices ALTER COLUMN client_id TYPE VARCHAR;
    ALTER TABLE estimates DROP CONSTRAINT estimates_client_id_foreign;
    ALTER TABLE estimates ALTER COLUMN client_id TYPE VARCHAR;
    ALTER TABLE clients ALTER COLUMN id TYPE VARCHAR;
    ALTER TABLE clients ALTER COLUMN id SET DEFAULT 0;
    ALTER TABLE estimates ADD CONSTRAINT estimates_client_id_foreign
    FOREIGN KEY (client_id) REFERENCES clients(id);
    ALTER TABLE invoices ADD CONSTRAINT invoices_client_id_foreign
    FOREIGN KEY (client_id) REFERENCES clients(id);`);
};

exports.down = async function (knex) {
    return await knex.raw(`ALTER TABLE invoices DROP CONSTRAINT invoices_client_id_foreign;
    ALTER TABLE invoices ALTER COLUMN client_id TYPE BIGINT USING client_id::bigint;
    ALTER TABLE estimates DROP CONSTRAINT estimates_client_id_foreign;
    ALTER TABLE estimates ALTER COLUMN client_id TYPE BIGINT USING client_id::bigint;
    ALTER TABLE clients ALTER COLUMN id TYPE BIGINT USING id::bigint;
    ALTER TABLE clients ALTER COLUMN id SET DEFAULT nextval('clients_id_seq'::regclass);
    ALTER TABLE estimates ADD CONSTRAINT estimates_client_id_foreign
    FOREIGN KEY (client_id) REFERENCES clients(id);
    ALTER TABLE invoices ADD CONSTRAINT invoices_client_id_foreign
    FOREIGN KEY (client_id) REFERENCES clients(id);`);
};
