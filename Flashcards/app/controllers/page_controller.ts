import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class PageController {
  async home({ view, auth }: HttpContext) {
    const decks = await Deck.all() // Récupérer tous les decks depuis la base de données
    return view.render('home', { user: auth.use('web').user, decks }) // Passe les decks à la vue
  }
}
