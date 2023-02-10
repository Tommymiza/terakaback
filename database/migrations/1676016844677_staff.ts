import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'staff'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string("email_staff", 255).unique().notNullable()
      table.string("password_staff", 255).notNullable()
      table.enum("fonction", ["admin", "staff"]).notNullable()
      table.boolean("is_staff_verified").defaultTo(false);
      table.bigInteger("num_cin_staff").nullable();
      table.string("photo_cin_staff", 255).nullable();
      table.string("photo_staff", 255).nullable();
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
