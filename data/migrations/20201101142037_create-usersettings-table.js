const { onUpdateTrigger } = require('../../config/knexfile')

exports.up = async function (knex) {
    return await knex.schema.createTable('user_settings', function (table) {
        table.bigIncrements();
        table.string('name');
        table.string('email');
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
    .then(() => knex.raw(onUpdateTrigger('user_settings')));
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_settings');
};
