import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Follow from '#models/follow'

export default class extends BaseSeeder {
  async run() {
    const follows = new Set()
    const followData = []
    
    while (followData.length < 15000) {
      const follower_id = Math.floor(Math.random() * 1000) + 1
      const following_id = Math.floor(Math.random() * 1000) + 1
      
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