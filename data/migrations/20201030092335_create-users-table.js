
exports.up = async function(knex) {
  return await knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable("users", function (table) {
        table.increments();
        table.string("name");
        table.string("email");
        table.string("picture");
        table.string("sub");
        table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("users");
};
