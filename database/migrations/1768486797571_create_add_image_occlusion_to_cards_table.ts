import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_card'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Type de carte: 'text' (par défaut) ou 'image_occlusion'
      table.string('card_type', 50).defaultTo('text').notNullable()

      // Image Base64 pour les cartes d'occlusion (stockée comme Data URL)
      table.text('image_path').nullable()

      // Données JSON pour les zones d'occlusion (rectangles en pourcentages)
      // Format: [{ id: 1, x: 0.25, y: 0.30, width: 0.15, height: 0.10 }, ...]
      table.json('occlusion_zones').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('card_type')
      table.dropColumn('image_path')
      table.dropColumn('occlusion_zones')
    })
  }
}