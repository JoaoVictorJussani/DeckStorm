import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Like from '#models/like'

export default class extends BaseSeeder {
  async run() {
    const likes = new Set()
    const likeData = []
    
    while (likeData.length < 10000) {
      const user_id = Math.floor(Math.random() * 1000) + 1
      const deck_id = Math.floor(Math.random() * 2000) + 1
      
      const likePair = `${user_id}-${deck_id}`
      if (!likes.has(likePair)) {
        likes.add(likePair)
        likeData.push({ user_id, deck_id })
      }
    }
    
    // Insert in chunks
    const chunkSize = 500
    for (let i = 0; i < likeData.length; i += chunkSize) {
      const chunk = likeData.slice(i, i + chunkSize)
      await Like.createMany(chunk)
    }
  }
}