
exports.up = async function(knex) {
  return await knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable("users", function (table) {
        table.increments();
        table.uuid("uuid").defaultTo(knex.raw("uuid_generate_v4()"));
        table.string("name");
        table.string("email");
        table.string("picture");
        table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("users");
};
