import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_user_stats'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().unique()
      table.integer('decks_studied').notNullable().defaultTo(0)
      table.integer('correct_answers').notNullable().defaultTo(0)
      table.integer('wrong_answers').notNullable().defaultTo(0)
      table.integer('total_study_time').notNullable().defaultTo(0)
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.foreign('user_id').references('id').inTable('t_user').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
