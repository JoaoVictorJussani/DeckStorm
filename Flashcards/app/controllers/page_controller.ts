import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class PageController {
  async home({ view, auth }: HttpContext) {
    const user = auth.use('web').user
    const decks = await Deck.query().where('user_id', user.id) // Filter decks by user ID
    return view.render('home', { user, decks }) // Pass the decks to the view
  }
}
