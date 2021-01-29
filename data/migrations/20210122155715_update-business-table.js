exports.up = async function (knex) {
    return await knex.schema.table('businesses', function (table) {
        table.boolean('is_hidden').defaultTo(true);
    });
};

exports.down = async function (knex) {
    return await knex.schema.table('businesses', function (table) {
        table.dropColumn('is_hidden');
    });
};
