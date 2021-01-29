exports.up = async function (knex) {
    return await knex.schema.table('clients', function (table) {
        table.boolean('is_hidden').defaultTo(true);
    });
};

exports.down = async function (knex) {
    return await knex.schema.table('clients', function (table) {
        table.dropColumn('is_hidden');
    });
};
