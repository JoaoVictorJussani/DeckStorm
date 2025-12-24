import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Notification extends BaseModel {
  public static table = 't_notification'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare message: string

  @column()
  declare type: string

  @column({ columnName: 'read', serializeAs: 'read' })
  declare read: boolean
  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column()
  declare deck_id?: number
}
