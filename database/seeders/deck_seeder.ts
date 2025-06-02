import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Deck from '#models/deck'

export default class extends BaseSeeder {
  async run() {
    const subjects = ['Math', 'History', 'Science', 'Geography', 'Literature', 'Programming', 'Languages', 'Art']
    const levels = ['Basic', 'Intermediate', 'Advanced']
    
    const decks = Array.from({ length: 2000 }, (_, i) => {
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      return {
        title: `${subject} - ${level} #${i + 1}`,
        description: `${level} level ${subject.toLowerCase()} flashcards`,
        user_id: Math.floor(Math.random() * 1000) + 1,
        visibility: Math.random() > 0.3 ? 'public' : 'private',
      }
    })
    
    await Deck.createMany(decks)
  }
}