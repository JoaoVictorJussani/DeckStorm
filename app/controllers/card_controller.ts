import type { HttpContext } from '@adonisjs/core/http';
import Card from '#models/card'; // Modèle des cartes
import Deck from '#models/deck'; // Modèle des decks

export default class CardController {
  // Affiche la page pour créer une nouvelle carte
  async create({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const deck = await Deck.find(params.deckId); // Récupère le deck par ID
    const user = auth.user; // Ajout : récupérer l'utilisateur connecté
    return view.render('newcard', { deck, user }); // Passer user à la vue
  }

  // Enregistre une nouvelle carte
  async store({ params, request, response, session, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const { question, answer } = request.only(['question', 'answer']); // Récupère les champs nécessaires

    // Vérifie si la question est vide
    if (!question || question.trim().length === 0) {
      session.flash('error', 'Le champ "Question" ne peut pas être vide.');
      session.flash('old', { question, answer }); // Conserve les anciennes données saisies
      return response.redirect().back();
    }

    // On supprime cette validation
    /* if (question.trim().length < 10) {
      session.flash('error', 'La question doit contenir au moins 10 caractères.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    } */

    // Vérifie si la réponse est vide
    if (!answer || answer.trim().length === 0) {
      session.flash('error', 'Le champ "Réponse" ne peut pas être vide.');
      session.flash('old', { question, answer }); // Conserve les anciennes données saisies
      return response.redirect().back();
    }

    // Vérifie si une carte avec la même question existe déjà dans le deck
    const existingCard = await Card.query()
      .where('deck_id', params.deckId)
      .andWhere('question', question.trim())
      .first();

    if (existingCard) {
      session.flash('error', 'Une carte avec cette question existe déjà dans ce deck.');
      session.flash('old', { question, answer }); // Conserve les anciennes données saisies
      return response.redirect().back();
    }

    // Crée une nouvelle carte
    await Card.create({ question: question.trim(), answer: answer.trim(), deck_id: params.deckId });

    session.flash('success', 'Carte créée avec succès !'); // Message de succès
    return response.redirect().toRoute('decks.show', { id: params.deckId }); // Redirige vers la page du deck
  }

  // Affiche une carte spécifique
  async show({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const card = await Card.find(params.cardId); // Récupère la carte par ID
    return view.render('showcard', { card }); // Rendu de la vue avec la carte
  }

  // Affiche la page pour modifier une carte
  async edit({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const card = await Card.find(params.cardId); // Récupère la carte par ID
    const deck = await Deck.find(params.deckId); // Récupère le deck par ID
    const user = auth.user;
    return view.render('edit_card', { card, deck, user }); // Rendu de la vue avec la carte
  }

  // Met à jour une carte
  async update({ params, request, response, session, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const deck = await Deck.find(params.deckId); // Récupère le deck par ID
    if (deck && auth.user && deck.user_id === auth.user.id) {  // Vérifie que l'utilisateur est le propriétaire
      const card = await Card.find(params.cardId); // Récupère la carte par ID
      if (card) {
        const data = request.only(['question', 'answer']); // Récupère les champs nécessaires
        card.merge(data); // Met à jour les champs de la carte
        await card.save(); // Enregistre les modifications
        session.flash('success', 'Carte mise à jour avec succès.'); // Message de succès
        return response.redirect().toRoute('decks.show', { id: deck.id }); // Redirige vers la page du deck
      }
    }
    session.flash('error', 'Vous ne pouvez pas modifier cette carte.'); // Message d'erreur
    return response.redirect().toRoute('home'); // Redirige vers la page d'accueil
  }
  

  // Supprime une carte
  async destroy({ params, response, session, auth }: HttpContext) {
    await auth.use('web').authenticate();
    const deck = await Deck.find(params.deckId); // Récupère le deck par ID
    if (deck && auth.user && deck.user_id === auth.user.id) { { // Vérifie que l'utilisateur est le propriétaire
      const card = await Card.find(params.cardId); // Récupère la carte par ID
      if (card) {
        await card.delete(); // Supprime la carte
        session.flash('success', 'Carte supprimée avec succès.'); // Message de succès
        return response.redirect().toRoute('decks.show', { id: deck.id }); // Redirige vers la page du deck
      }
    }
    session.flash('error', 'Vous ne pouvez pas supprimer cette carte.'); // Message d'erreur
    return response.redirect().toRoute('home'); // Redirige vers la page d'accueil
  }
}
}