import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Card from '#models/card'

export default class extends BaseSeeder {
  async run() {
    const cards = Array.from({ length: 10000 }, (_, i) => ({
      question: `Sample Question ${i + 1}`,
      answer: `Sample Answer ${i + 1}`,
      deck_id: Math.floor(i / 5) + 1, // Distributes ~5 cards per deck
    }))
    
    // Insert in chunks to avoid memory issues
    const chunkSize = 500
    for (let i = 0; i < cards.length; i += chunkSize) {
      const chunk = cards.slice(i, i + chunkSize)
      await Card.createMany(chunk)
    }
  }
}