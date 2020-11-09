exports.up = async function (knex) {
    return await knex.schema.createTable('items', function (table) {
        table.bigIncrements();
        table.string('description');
        table.float('rate');
        table
            .bigInteger('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('clients');
};
