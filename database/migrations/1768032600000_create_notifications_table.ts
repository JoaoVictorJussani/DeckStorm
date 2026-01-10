import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_notification'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable()
      table.string('message').notNullable()
      table.string('type').notNullable()
      table.boolean('read').notNullable().defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.integer('deck_id').unsigned().nullable()
      table.foreign('user_id').references('id').inTable('t_user').onDelete('CASCADE')
      table.foreign('deck_id').references('id').inTable('t_deck').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
