const { onUpdateTrigger } = require('../../config/knexfile');

exports.up = async function (knex) {
    return await knex.schema
        .createTable('estimate_items', function (table) {
            table
                .bigInteger('estimate_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('estimates')
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
            table.primary(['estimate_id', 'item_id']);
            table.timestamps(true, true);
        })
        .then(() => knex.raw(onUpdateTrigger('estimate_items')));
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('estimate_items');
};
