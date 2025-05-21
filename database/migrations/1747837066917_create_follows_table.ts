import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 't_follow'

  async up() {
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id')
      table.integer('follower_id').unsigned().notNullable()
      table.integer('following_id').unsigned().notNullable()
      table.foreign('follower_id').references('id').inTable('t_user').onDelete('CASCADE')
      table.foreign('following_id').references('id').inTable('t_user').onDelete('CASCADE')
      table.unique(['follower_id', 'following_id'])
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
