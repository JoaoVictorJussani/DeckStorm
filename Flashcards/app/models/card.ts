import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Card extends BaseModel {
  public static table = 't_card'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare question: string

  @column()
  declare answer: string

  @column()
  declare deck_id: number
}
