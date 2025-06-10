import type { HttpContext } from '@adonisjs/core/http';
import Deck from '#models/deck';
import Like from '#models/like';

export default class DeckController {
  // Création d'un deck
  async store({ request, response, session, auth }: HttpContext) {
    const data = request.only(['title', 'description', 'visibility']); // Récupère uniquement les champs nécessaires

    // Vérifie si un deck avec le même titre existe déjà
    const existingDeck = await Deck.findBy('title', data.title);
    if (existingDeck) {
      session.flash('error', 'Un deck avec ce titre existe déjà.');
      session.flash('old', data); // Conserve les anciennes données saisies
      return response.redirect().back();
    }

    // Vérifie la longueur de la description
    if (data.description.length > 125) {
      session.flash('error', 'La description ne peut pas dépasser 125 caractères.');
      session.flash('old', data);
      return response.redirect().back();
    }

    const deck = new Deck();
    deck.title = data.title; // Définit le titre
    deck.description = data.description; // Définit la description
    deck.visibility = data.visibility; // Définit la visibilité
    if (auth.user) {
      deck.user_id = auth.user.id; // Associe le deck à l'utilisateur connecté
    } else {
      session.flash('error', 'Utilisateur non authentifié.');
      return response.unauthorized('User not authenticated');
    }

    await deck.save(); // Enregistre le deck dans la base de données

    session.flash('success', 'Deck créé avec succès !'); // Message de succès
    return response.redirect().toRoute('home'); // Redirige vers la page d'accueil
  }

  // Mise à jour d'un deck
  async update({ params, request, response, session, auth }: HttpContext) {
    const deck = await Deck.find(params.id);
    if (deck && deck.user_id === auth.user.id) {
      const data = request.only(['title', 'description', 'visibility']);

      // Vérifie la longueur de la description
      if (data.description.length > 125) {
        session.flash('error', 'La description ne peut pas dépasser 125 caractères.');
        return response.redirect().back();
      }

      deck.merge(data);
      await deck.save();
      session.flash('success', 'Deck mis à jour avec succès !');
    } else {
      session.flash('error', 'Vous ne pouvez pas modifier ce deck.');
    }
    return response.redirect().toRoute('home');
  }

  // Suppression d'un deck
  async destroy({ params, response, session, auth }: HttpContext) {
    const deck = await Deck.find(params.id); // Récupère le deck par ID
    if (deck && deck.user_id === auth.user.id) { // Vérifie que l'utilisateur est le propriétaire
      await deck.delete(); // Supprime le deck
      session.flash('success', 'Deck supprimé avec succès !'); // Message de succès
    } else {
      session.flash('error', 'Vous ne pouvez pas supprimer ce deck.'); // Message d'erreur
    }
    return response.redirect().toRoute('home'); // Redirige vers la page d'accueil
  }

  // Like a deck
  async like({ params, auth, response, request }: HttpContext) {
    const userId = auth.user.id
    const deckId = Number(params.id)
    const returnView = request.input('returnView')
    
    const exists = await Like.query().where('user_id', userId).andWhere('deck_id', deckId).first()
    if (!exists) {
      await Like.create({ user_id: userId, deck_id: deckId })
    }
    
    // Return to the same view
    if (returnView === 'list') {
      return response.redirect().back({ qs: { view: 'list' } })
    }
    return response.redirect().back()
  }

  // Unlike a deck
  async unlike({ params, auth, response, request }: HttpContext) {
    const userId = auth.user.id
    const deckId = Number(params.id)
    const returnView = request.input('returnView')
    
    await Like.query().where('user_id', userId).andWhere('deck_id', deckId).delete()
    
    // Return to the same view
    if (returnView === 'list') {
      return response.redirect().back({ qs: { view: 'list' } })
    }
    return response.redirect().back()
  }

  // API endpoints for likes
  async apiLike({ params, auth, response }: HttpContext) {
    const userId = auth.user.id
    const deckId = Number(params.id)
    
    const exists = await Like.query()
      .where('user_id', userId)
      .andWhere('deck_id', deckId)
      .first()

    if (!exists) {
      await Like.create({ user_id: userId, deck_id: deckId })
    }

    const likesCount = await Like.query()
      .where('deck_id', deckId)
      .count('* as total')

    return response.json({
      success: true,
      likesCount: likesCount[0].$extras.total
    })
  }

  async apiUnlike({ params, auth, response }: HttpContext) {
    const userId = auth.user.id
    const deckId = Number(params.id)
    
    await Like.query()
      .where('user_id', userId)
      .andWhere('deck_id', deckId)
      .delete()

    const likesCount = await Like.query()
      .where('deck_id', deckId)
      .count('* as total')

    return response.json({
      success: true,
      likesCount: likesCount[0].$extras.total
    })
  }
}
