import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class DeckController {
  // Création d'un deck
  async store({ request, response, session, auth }: HttpContext) {
    const data = request.only(['title', 'description']);

    // Check if a deck with the same title already exists
    const existingDeck = await Deck.findBy('title', data.title);
    if (existingDeck) {
      session.flash('error', 'Un deck avec ce titre existe déjà.');
      session.flash('old', data); // Preserve old input
      return response.redirect().back();
    }

    // Check if the description is less than 10 characters
    if (data.description.length < 10) {
      session.flash('error', 'La description doit contenir au moins 10 caractères.');
      session.flash('old', data); // Preserve old input
      return response.redirect().back();
    }

    const deck = new Deck();
    deck.title = data.title;
    deck.description = data.description;
    if (auth.user) {
      deck.user_id = auth.user.id;
    } else {
      session.flash('error', 'Utilisateur non authentifié.');
      return response.unauthorized('User not authenticated');
    }

    await deck.save();

    session.flash('success', 'Deck créé avec succès !'); // Flash message for deck creation
    return response.redirect().toRoute('home');
  }

  // Mise à jour d'un deck
  async update({ params, request, response, session }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (deck) {
      const data = request.only(['title', 'description'])
      deck.merge(data)
      await deck.save()
      session.flash('success', 'Deck mis à jour avec succès !'); // Flash message for deck modification
    } else {
      session.flash('error', 'Deck non trouvé.')
    }
    return response.redirect().toRoute('home')
  }

  // Suppression d'un deck
  async destroy({ params, response, session }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (deck) {
      await deck.delete()
      session.flash('success', 'Deck supprimé avec succès !'); // Flash message for deck deletion
    } else {
      session.flash('error', 'Deck non trouvé.')
    }
    return response.redirect().toRoute('home')
  }
}
