import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Follow from '#models/follow'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const users = await User.query().select('id')
    const userIds = users.map((user) => user.id)

    if (userIds.length < 2) {
      console.log('Not enough users to seed follows')
      return
    }

    const follows = new Set()
    const followData = []

    while (followData.length < 75000) {
      const follower_id = userIds[Math.floor(Math.random() * userIds.length)]
      const following_id = userIds[Math.floor(Math.random() * userIds.length)]

      const followPair = `${follower_id}-${following_id}`
      if (follower_id !== following_id && !follows.has(followPair)) {
        follows.add(followPair)
        followData.push({ follower_id, following_id })
      }
    }

    // Insert in chunks
    const chunkSize = 500
    for (let i = 0; i < followData.length; i += chunkSize) {
      const chunk = followData.slice(i, i + chunkSize)
      await Follow.createMany(chunk)
    }
  }
}