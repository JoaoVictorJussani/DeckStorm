import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_deck'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('allowed_modes').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('allowed_modes')
    })
  }
}