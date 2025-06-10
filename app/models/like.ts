import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Deck from '#models/deck'

export default class Like extends BaseModel {
  public static table = 't_like'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare deck_id: number

  @belongsTo(() => User, { foreignKey: 'user_id' }) 
  public user!: import('@adonisjs/lucid/types/relations').BelongsTo<typeof User>

  @belongsTo(() => Deck, { foreignKey: 'deck_id' })
  public deck!: import('@adonisjs/lucid/types/relations').BelongsTo<typeof Deck>
}