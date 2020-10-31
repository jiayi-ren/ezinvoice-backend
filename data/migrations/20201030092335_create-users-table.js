
exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-oosp"')
    .createTable("users", function (table) {
        table.string("id").notNullable().unique().primary();
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
