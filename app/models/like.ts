import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class Like extends BaseModel {
  public static table = 't_like'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare deck_id: number

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: InstanceType<typeof User>

  @belongsTo(() => Deck, { foreignKey: 'deck_id' })
  public deck: InstanceType<typeof Deck>
}

// Import User and Deck after the class definition to avoid circular reference issues
import User from '#models/user'
import Deck from '#models/deck'
