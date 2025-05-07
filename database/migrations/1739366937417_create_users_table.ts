import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_user';

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id');
      table.string('username', 255).notNullable().unique();
      table.string('password', 180).notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now());
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
