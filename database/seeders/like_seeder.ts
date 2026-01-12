import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Like from '#models/like'
import User from '#models/user'
import Deck from '#models/deck'

export default class extends BaseSeeder {
  async run() {
    const users = await User.query().select('id')
    const userIds = users.map((u) => u.id)

    const decks = await Deck.query().select('id')
    const deckIds = decks.map((d) => d.id)

    if (userIds.length === 0 || deckIds.length === 0) {
      console.log('Not enough users or decks to seed likes')
      return
    }

    const likes = new Set()
    const likeData = []

    while (likeData.length < 50000) {
      const user_id = userIds[Math.floor(Math.random() * userIds.length)]
      const deck_id = deckIds[Math.floor(Math.random() * deckIds.length)]

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