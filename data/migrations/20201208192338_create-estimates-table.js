const { onUpdateTrigger } = require('../../config/knexfile');

exports.up = async function (knex) {
    return await knex.schema
        .createTable('estimates', function (table) {
            table.bigIncrements();
            table.string('title');
            table.string('doc_number');
            table
                .bigInteger('user_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .bigInteger('business_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('businesses')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .bigInteger('client_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('clients')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.boolean('is_paid');
            table.date('date');
            table.string('notes');
            table.timestamps(true, true);
        })
        .then(() => knex.raw(onUpdateTrigger('estimates')));
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('estimates');
};
