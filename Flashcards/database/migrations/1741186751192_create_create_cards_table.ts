import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_card'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.text('question').notNullable() // La question de la carte
      table.text('answer').notNullable()   // La réponse de la carte
      table.integer('deck_id').unsigned().notNullable() // Clé étrangère vers t_deck
      table.foreign('deck_id').references('id').inTable('t_deck').onDelete('CASCADE') // Définir la clé étrangère
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
