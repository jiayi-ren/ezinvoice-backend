exports.up = async function (knex) {
    return await knex.schema.createTable('clients', function (table) {
        table.increments();
        table.string('name');
        table.string('email').unique();
        table.string('street');
        table.string('city_state');
        table.string('zip');
        table.string('phone');
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('clients');
};
