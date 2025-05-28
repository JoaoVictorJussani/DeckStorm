import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_like'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable()
      table.integer('deck_id').unsigned().notNullable()
      table.foreign('user_id').references('id').inTable('t_user').onDelete('CASCADE')
      table.foreign('deck_id').references('id').inTable('t_deck').onDelete('CASCADE')
      table.unique(['user_id', 'deck_id'])
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
