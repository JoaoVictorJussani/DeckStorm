import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'; // Remove BelongsTo from import
import Card from '#models/card';
import User from '#models/user'; // Import the User model

export default class Deck extends BaseModel {
  public static table = 't_deck'; // Nom de la table

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare title: string;

  @column()
  declare description: string;

  @column()
  declare user_id: number; // Ajout de la colonne user_id

  @column()
  declare visibility: 'private' | 'public'; // Add visibility column

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => Card, { foreignKey: 'deck_id' })
  public cards: Card[];

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: User; // Correct the type to User
}
