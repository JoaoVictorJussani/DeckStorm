import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class PageController {
  async home({ view, auth }: HttpContext) {
    const user = auth.use('web').user;

    // Fetch only the current user's decks
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards') // Preload cards to get the count
      .preload('user'); // Preload the user relationship

    // Fetch public decks from other users
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .preload('cards') // Preload cards to get the count
      .preload('user'); // Preload the user relationship

    return view.render('home', { user, userDecks, publicDecks });
  }
}
