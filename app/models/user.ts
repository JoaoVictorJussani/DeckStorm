import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany as HasManyRelation } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Follow from '#models/follow'
import Like from '#models/like'
import Deck from '#models/deck'
import UserStats from '#models/user_stats'
import { hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username', 'email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  // Renommer le nom de la table pour respecter les conventions de nommage de l'ETML
  public static table = 't_user'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare email: string | null

  @column()
  declare oauthProvider: string | null

  @column()
  declare oauthId: string | null

  @column()
  declare avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
  @hasMany(() => Follow, { foreignKey: 'follower_id' })
  public following!: HasManyRelation<typeof Follow>

  @hasMany(() => Follow, { foreignKey: 'following_id' })
  public followers!: HasManyRelation<typeof Follow>

  @hasMany(() => Like, { foreignKey: 'user_id' })
  public likes!: HasManyRelation<typeof Like> // Relation avec les likes de l'utilisateur

  @hasMany(() => Deck, { foreignKey: 'user_id' }) // Ajout de la relation avec les decks
  public decks!: HasManyRelation<typeof Deck>

  @hasOne(() => UserStats, { foreignKey: 'user_id' })
  public stats!: HasOne<typeof UserStats>
}
