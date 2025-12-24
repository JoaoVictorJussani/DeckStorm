import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Deck from '#models/deck'
import Card from '#models/card'

export default class ExerciseAttempt extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number

    @column()
    declare deckId: number

    @column()
    declare cardId: number

    @column()
    declare isCorrect: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Deck)
    declare deck: BelongsTo<typeof Deck>

    @belongsTo(() => Card)
    declare card: BelongsTo<typeof Card>
}
