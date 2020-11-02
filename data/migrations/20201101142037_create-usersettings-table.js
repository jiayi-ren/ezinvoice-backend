exports.up = async function (knex) {
    return await knex.schema.createTable('userSettings', function (table) {
        table.increments();
        table.string('name');
        table.string('email');
        table.string('street');
        table.string('cityState');
        table.string('zip');
        table.string('phone');
        table.integer('userId').notNullable().references('id').inTable('users');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('userSettings');
};
