import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class UserStats extends BaseModel {
  public static table = 't_user_stats'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare decks_studied: number

  @column()
  declare correct_answers: number

  @column()
  declare wrong_answers: number

  @column()
  declare total_study_time: number // em segundos

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
