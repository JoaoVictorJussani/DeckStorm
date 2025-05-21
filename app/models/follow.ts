import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Follow extends BaseModel {
  public static table = 't_follow'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare follower_id: number

  @column()
  declare following_id: number
}
