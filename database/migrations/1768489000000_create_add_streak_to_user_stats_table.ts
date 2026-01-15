import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 't_user_stats'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('current_streak').defaultTo(0)
            table.integer('longest_streak').defaultTo(0)
            table.date('last_study_date').nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('current_streak')
            table.dropColumn('longest_streak')
            table.dropColumn('last_study_date')
        })
    }
}
