import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        username: 'lisa',
        password: '1234',
      },
      {
        username: 'bernard',
        password: '1234',
      },
      {
        username: 'bastien',
        password: '5678',
      },
      {
        username: 'julie',
        password: '5678',
      },
    ])
  }
}
