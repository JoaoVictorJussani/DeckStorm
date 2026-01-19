import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

import Deck from '#models/deck'

export default class Group extends BaseModel {
    public static table = 't_group'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column()
    declare description: string | null

    @column()
    declare teacherId: number

    @column()
    declare inviteCode: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => User, { foreignKey: 'teacherId' })
    declare teacher: BelongsTo<typeof User>

    @manyToMany(() => User, {
        pivotTable: 't_group_member',
        pivotForeignKey: 'group_id',
        pivotRelatedForeignKey: 'user_id',
        pivotTimestamps: false,
    })
    declare members: ManyToMany<typeof User>

    @manyToMany(() => Deck, {
        pivotTable: 't_group_deck',
        pivotForeignKey: 'group_id',
        pivotRelatedForeignKey: 'deck_id',
        pivotTimestamps: true,
    })
    declare decks: ManyToMany<typeof Deck>
}
