import { BaseModel, column } from '@adonisjs/lucid/orm' // Importation des fonctionnalités de Lucid ORM

// Interface pour les zones d'occlusion
export interface OcclusionZone {
  id: number
  x: number
  y: number
  width: number
  height: number
  label?: string
}

export default class Card extends BaseModel {
  public static table = 't_card' // Nom de la table dans la base de données

  @column({ isPrimary: true })
  declare id: number // Identifiant unique de la carte

  @column()
  declare question: string // Question de la carte

  @column()
  declare answer: string // Réponse de la carte

  @column({ columnName: 'deck_id' })
  declare deck_id: number // Identifiant du deck auquel appartient la carte

  // Ajout d'un alias deckId pour la relation HasMany attendue par AdonisJS
  @column({ columnName: 'deck_id' })
  declare deckId: number

  // Type de carte: 'text' ou 'image_occlusion'
  @column({ columnName: 'card_type' })
  declare cardType: string

  // Chemin vers l'image pour les cartes d'occlusion
  @column({ columnName: 'image_path' })
  declare imagePath: string | null

  // Zones d'occlusion (JSON)
  @column({
    columnName: 'occlusion_zones',
    prepare: (value: OcclusionZone[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | object | null) => {
      if (!value) return null
      // If it's already an object (PostgreSQL may return parsed JSON), return it
      if (typeof value === 'object') return value as OcclusionZone[]
      // If it's a string, parse it
      try {
        return JSON.parse(value as string) as OcclusionZone[]
      } catch (e) {
        console.error('Failed to parse occlusion zones:', e)
        return null
      }
    },
  })
  declare occlusionZones: OcclusionZone[] | null
}
