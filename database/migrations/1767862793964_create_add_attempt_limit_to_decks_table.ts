import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_deck'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('attempt_limit').unsigned().nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('attempt_limit')
    })
  }
}
