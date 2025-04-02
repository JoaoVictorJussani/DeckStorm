import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'; // Importation des relations
import Card from '#models/card'; // Modèle des cartes
import User from '#models/user'; // Modèle des utilisateurs

export default class Deck extends BaseModel {
  public static table = 't_deck'; // Nom de la table dans la base de données

  @column({ isPrimary: true })
  declare id: number; // Identifiant unique du deck

  @column()
  declare title: string; // Titre du deck

  @column()
  declare description: string; // Description du deck

  @column()
  declare user_id: number; // Identifiant de l'utilisateur propriétaire du deck

  @column()
  declare visibility: 'private' | 'public'; // Visibilité du deck (privé ou public)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime; // Date de création

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime; // Date de mise à jour

  @hasMany(() => Card, { foreignKey: 'deck_id' })
  public cards: Card[]; // Relation avec les cartes du deck

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: User; // Relation avec l'utilisateur propriétaire
}
