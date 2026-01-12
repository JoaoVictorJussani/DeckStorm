import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_user'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // OAuth provider (google, github, etc.)
      table.string('oauth_provider', 50).nullable()

      // OAuth provider user ID
      table.string('oauth_id').nullable()

      // User's email from OAuth provider
      table.string('email').nullable()

      // User's avatar URL from OAuth provider
      table.string('avatar_url').nullable()

      // Make password nullable since OAuth users don't need a password
      table.string('password').nullable().alter()

      // Add unique constraint on oauth_provider + oauth_id combination
      table.unique(['oauth_provider', 'oauth_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['oauth_provider', 'oauth_id'])
      table.dropColumn('oauth_provider')
      table.dropColumn('oauth_id')
      table.dropColumn('email')
      table.dropColumn('avatar_url')
    })
  }
}