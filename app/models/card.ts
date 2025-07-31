import { BaseModel, column } from '@adonisjs/lucid/orm'; // Importation des fonctionnalités de Lucid ORM

export default class Card extends BaseModel {
  public static table = 't_card'; // Nom de la table dans la base de données

  @column({ isPrimary: true })
  declare id: number; // Identifiant unique de la carte

  @column()
  declare question: string; // Question de la carte

  @column()
  declare answer: string; // Réponse de la carte

  @column({ columnName: 'deck_id' })
  declare deck_id: number; // Identifiant du deck auquel appartient la carte

  // Ajout d'un alias deckId pour la relation HasMany attendue par AdonisJS
  @column({ columnName: 'deck_id' })
  declare deckId: number;
}
