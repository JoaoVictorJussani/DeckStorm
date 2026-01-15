import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_card'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Modifier le type de image_path de varchar(500) à text pour stocker les images Base64
      table.text('image_path').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revenir à varchar(500)
      table.string('image_path', 500).alter()
    })
  }
}