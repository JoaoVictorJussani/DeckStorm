import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'exercise_attempts'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
            table.integer('deck_id').unsigned().references('id').inTable('decks').onDelete('CASCADE')
            table.integer('card_id').unsigned().references('id').inTable('cards').onDelete('CASCADE')
            table.boolean('is_correct').notNullable()

            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
