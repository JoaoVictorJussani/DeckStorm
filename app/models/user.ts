import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany as HasManyRelation } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Follow from '#models/follow'
import Like from '#models/like'
import Deck from '#models/deck' // Ajout de l'importation de Deck

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
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
  declare password: string

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
}
