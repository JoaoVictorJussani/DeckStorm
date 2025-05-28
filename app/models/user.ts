import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Follow from '#models/follow'
import Like from '#models/like' // Ajout pour les likes

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
  public following: Follow[]

  @hasMany(() => Follow, { foreignKey: 'following_id' })
  public followers: Follow[]

  @hasMany(() => Like, { foreignKey: 'user_id' })
  public likes: Like[] // Relation avec les likes de l'utilisateur
}
