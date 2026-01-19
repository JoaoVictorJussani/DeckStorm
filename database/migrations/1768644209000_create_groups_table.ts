import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 't_group'

    async up() {
        if (!(await this.schema.hasTable(this.tableName))) {
            this.schema.createTable(this.tableName, (table) => {
                table.increments('id')
                table.string('name').notNullable()
                table.text('description').nullable()
                table.integer('teacher_id').unsigned().references('id').inTable('t_user').onDelete('CASCADE')
                table.string('invite_code').notNullable().unique()
                table.timestamp('created_at')
                table.timestamp('updated_at')
            })
        }
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
