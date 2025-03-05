import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class DeckController {
  // Création d'un deck
  async store({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'description'])

    const deck = new Deck()
    deck.title = data.title
    deck.description = data.description

    await deck.save()

    session.flash('success', 'Deck créé avec succès !')
    return response.redirect().toRoute('home')
  }

}
