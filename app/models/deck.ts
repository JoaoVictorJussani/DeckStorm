import { DateTime } from 'luxon';
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm';
import Card from '#models/card';
import Like from '#models/like';

export default class Deck extends BaseModel {
  public static table = 't_deck';

  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare title: string;

  @column()
  declare description: string;

  @column()
  declare user_id: number;

  @column()
  declare visibility: 'private' | 'public';

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => Card, { foreignKey: 'deck_id' })
  public cards: Card[];

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: InstanceType<typeof User>;

  @hasMany(() => Like, { foreignKey: 'deck_id' })
  public likes: Like[];
}

// Import User after the class definition to avoid circular reference issues
import User from '#models/user';
