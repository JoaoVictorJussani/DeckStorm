import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_deck'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description')
      table.integer('user_id').unsigned().notNullable() // Colonne pour la clé étrangère
      table.foreign('user_id').references('id').inTable('t_user').onDelete('CASCADE') // Définir la clé étrangère
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
