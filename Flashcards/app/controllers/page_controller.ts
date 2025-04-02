import type { HttpContext } from '@adonisjs/core/http'; // Type pour le contexte HTTP
import Deck from '#models/deck'; // Importation du modèle Deck

export default class PageController {
  // Méthode pour afficher la page d'accueil
  async home({ view, auth }: HttpContext) {
    const user = auth.use('web').user; // Récupération de l'utilisateur connecté

    // Récupérer les decks de l'utilisateur connecté
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards') // Précharger les cartes pour obtenir leur nombre
      .preload('user'); // Précharger la relation utilisateur

    // Récupérer les decks publics des autres utilisateurs
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .preload('cards') // Précharger les cartes
      .preload('user'); // Précharger la relation utilisateur

    // Rendre la vue avec les données
    return view.render('home', { user, userDecks, publicDecks });
  }

  // Méthode pour rechercher des decks publics
  async searchPublicDecks({ request, view, auth }: HttpContext) {
    const user = auth.use('web').user; // Récupération de l'utilisateur connecté
    const query = request.input('query', '').trim(); // Récupération de la requête de recherche

    // Récupérer les decks personnels de l'utilisateur
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards') // Précharger les cartes
      .preload('user'); // Précharger la relation utilisateur

    // Récupérer les decks publics correspondant à la recherche
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .andWhere('title', 'like', `%${query}%`) // Filtrer par titre
      .preload('cards') // Précharger les cartes
      .preload('user'); // Précharger la relation utilisateur

    // Rendre la vue avec les résultats de la recherche
    return view.render('home', { user, userDecks, publicDecks, query });
  }
}
