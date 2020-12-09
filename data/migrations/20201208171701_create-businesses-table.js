const { onUpdateTrigger } = require('../../config/knexfile');

exports.up = async function (knex) {
    return await knex.schema
        .createTable('businesses', function (table) {
            table.bigIncrements();
            table.string('name');
            table.string('email').unique();
            table.string('street');
            table.string('city_state');
            table.string('zip');
            table.string('phone');
            table
                .bigInteger('user_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.timestamps(true, true);
        })
        .then(() => knex.raw(onUpdateTrigger('businesses')));
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};
