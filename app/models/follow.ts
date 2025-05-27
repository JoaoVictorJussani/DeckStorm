import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class Follow extends BaseModel {
  public static table = 't_follow'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare follower_id: number

  @column()
  declare following_id: number

  @belongsTo(() => User, { foreignKey: 'follower_id' })
  public follower: InstanceType<typeof User>

  @belongsTo(() => User, { foreignKey: 'following_id' })
  public following: InstanceType<typeof User>
}

// Import User after the class definition to avoid circular reference issues
import User from '#models/user'
