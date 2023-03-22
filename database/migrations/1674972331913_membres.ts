import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "membres";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("nom", 255).notNullable();
      table.string("prenom", 255).notNullable();
      table.string("pseudo", 255).notNullable().unique();
      table.string("password", 255).notNullable();
      table.string("email", 255).nullable().unique();
      table.string("phone", 30).nullable();
      table.string("ln", 30).notNullable();
      table.json("adresse").notNullable();
      table.json("formation").defaultTo({});
      table.string("role", 255).notNullable();
      table.string("is_pg", 4).notNullable();
      table.boolean("is_verified").defaultTo(false);
      table.bigInteger("num_cin").nullable();
      table.string("photo_cin", 255).nullable();
      table.string("photo", 255).nullable();
      table.json("staff").nullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
