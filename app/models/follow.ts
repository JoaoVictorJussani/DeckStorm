import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Follow extends BaseModel {
  public static table = 't_follow'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare follower_id: number

  @column()
  declare following_id: number

  @belongsTo(() => User, { foreignKey: 'follower_id' })
  public follower!: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'following_id' })
  public following!: BelongsTo<typeof User>
}
