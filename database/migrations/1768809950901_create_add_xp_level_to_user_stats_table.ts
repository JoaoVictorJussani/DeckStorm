import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_user_stats'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('xp').defaultTo(0)
      table.integer('level').defaultTo(1)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('xp')
      table.dropColumn('level')
    })
  }
}