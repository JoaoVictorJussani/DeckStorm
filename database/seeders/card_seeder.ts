import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Card from '#models/card'
import Deck from '#models/deck'

export default class extends BaseSeeder {
  async run() {
    const decks = await Deck.query().select('id')
    const deckIds = decks.map((deck) => deck.id)

    if (deckIds.length === 0) {
      console.log('No decks found. Skipping card seeding.')
      return
    }

    const cards = Array.from({ length: 10000 }, (_, i) => ({
      question: `Sample Question ${i + 1}`,
      answer: `Sample Answer ${i + 1}`,
      deck_id: deckIds[i % deckIds.length], // Distribute cards across all existing decks
    }))

    // Insert in chunks to avoid memory issues
    const chunkSize = 500
    for (let i = 0; i < cards.length; i += chunkSize) {
      const chunk = cards.slice(i, i + chunkSize)
      await Card.createMany(chunk)
    }
  }
}