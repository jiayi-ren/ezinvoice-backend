const { onUpdateTrigger } = require('../../config/knexfile');

exports.up = async function (knex) {
    return await knex.schema
        .createTable('invoice_items', function (table) {
            table
                .bigInteger('invoice_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('invoices')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .bigInteger('item_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('items')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.integer('quantity');
            table.primary(['invoice_id', 'item_id']);
            table.timestamps(true, true);
        })
        .then(() => knex.raw(onUpdateTrigger('invoice_items')));
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('invoice_items');
};
