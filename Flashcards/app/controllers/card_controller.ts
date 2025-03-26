import type { HttpContext } from '@adonisjs/core/http'
import Card from '#models/card' // Fix the import path
import Deck from '#models/deck' // Fix the import path

export default class CardController {
  async create({ params, view }: HttpContext) {
    const deck = await Deck.find(params.deckId)
    return view.render('newcard', { deck })
  }

  async store({ params, request, response, session }: HttpContext) {
    const { question, answer } = request.only(['question', 'answer']);

    // Check if the question is missing or empty
    if (!question || question.trim().length === 0) {
      session.flash('error', 'Le champ "Question" ne peut pas être vide.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    }

    // Check if the question is less than 10 characters
    if (question.trim().length < 10) {
      session.flash('error', 'La question doit contenir au moins 10 caractères.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    }

    // Check if the answer is missing or empty
    if (!answer || answer.trim().length === 0) {
      session.flash('error', 'Le champ "Réponse" ne peut pas être vide.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    }

    // Check if the question already exists in the deck
    const existingCard = await Card.query()
      .where('deck_id', params.deckId)
      .andWhere('question', question.trim())
      .first();

    if (existingCard) {
      session.flash('error', 'Une carte avec cette question existe déjà dans ce deck.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    }

    // Create the new card
    await Card.create({ question: question.trim(), answer: answer.trim(), deck_id: params.deckId });

    session.flash('success', 'Carte créée avec succès !'); // Flash message for card creation
    return response.redirect().toRoute('decks.show', { id: params.deckId });
  }

  async show({ params, view }: HttpContext) {
    const card = await Card.find(params.cardId)
    return view.render('showcard', { card })
  }

  async edit({ params, view }: HttpContext) {
    const card = await Card.find(params.cardId)
    return view.render('editcard', { card })
  }

  async update({ params, request, response, session }: HttpContext) {
    const card = await Card.find(params.cardId);
    const { question, answer } = request.only(['question', 'answer']);

    if (card) {
      card.merge({ question, answer });
      await card.save();
      session.flash('success', 'Carte mise à jour avec succès !'); // Flash message for card modification
    } else {
      session.flash('error', 'Carte non trouvée.');
    }

    return response.redirect().toRoute('decks.show', { id: params.deckId });
  }

  async destroy({ params, response, session }: HttpContext) {
    const card = await Card.find(params.cardId);
    if (card) {
      await card.delete();
      session.flash('success', 'Carte supprimée avec succès !'); // Flash message for card deletion
    } else {
      session.flash('error', 'Carte non trouvée.');
    }
    return response.redirect().toRoute('decks.show', { id: params.deckId });
  }
}
