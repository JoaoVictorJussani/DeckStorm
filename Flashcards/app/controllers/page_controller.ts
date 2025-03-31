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

  async searchPublicDecks({ request, view, auth }: HttpContext) {
    const user = auth.use('web').user;
    const query = request.input('query', '').trim();

    // Récupérer tous les decks personnels de l'utilisateur (non affectés par la recherche)
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards') // Précharger les cartes
      .preload('user'); // Précharger la relation utilisateur

    // Récupérer uniquement les decks publics correspondant à la recherche
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .andWhere('title', 'like', `%${query}%`) // Filtrer par titre
      .preload('cards') // Précharger les cartes
      .preload('user'); // Précharger la relation utilisateur

    return view.render('home', { user, userDecks, publicDecks, query });
  }
}
