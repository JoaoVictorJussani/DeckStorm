import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 't_group_member'

    async up() {
        if (!(await this.schema.hasTable(this.tableName))) {
            this.schema.createTable(this.tableName, (table) => {
                table.increments('id')
                table.integer('group_id').unsigned().references('id').inTable('t_group').onDelete('CASCADE')
                table.integer('user_id').unsigned().references('id').inTable('t_user').onDelete('CASCADE')
                table.timestamp('joined_at').defaultTo(this.now())

                table.unique(['group_id', 'user_id'])
            })
        }
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
