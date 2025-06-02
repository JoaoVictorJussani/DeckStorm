import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const users = Array.from({ length: 1000 }, (_, i) => ({
      username: `user${i + 1}`,
      password: '12345678', // In production, you'd want to hash these
    }))
    await User.createMany(users)
  }
}
