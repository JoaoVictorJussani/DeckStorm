import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class ExerciseController {
  async start({ params, view, request, auth }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards' as any).first()
    if (!deck) {
      return view.render('./pages/errors/not_found')
    }
    // Pour le mode jusqu'au bout, possibilité de passer une liste de cartes à réviser
    let retryCardIds = request.input('retryCardIds', null)
    if (retryCardIds && !Array.isArray(retryCardIds)) {
      retryCardIds = [retryCardIds]
    }
    retryCardIds = retryCardIds ? retryCardIds.map(Number).filter(Boolean) : null
    const cards = deck.cards ? deck.cards.map((card: any) => card.toJSON()) : []
    let filteredCards = cards
    if (retryCardIds && retryCardIds.length > 0) {
      filteredCards = cards.filter((card: any) => retryCardIds.includes(card.id))
    }
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')
    const user = auth.user
    return view.render('start', { deck, cards: filteredCards, retryCardIds, attempts, direction, user })
    return view.render('start', { deck, cards, retryCardIds, attempts, direction, user })
  }

  async presentQuestion({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards' as any).first();
    if (!deck) {
      return view.render('./pages/errors/not_found');
    }
    let retryCardIds = request.input('retryCardIds', null)
    if (retryCardIds && !Array.isArray(retryCardIds)) {
      retryCardIds = [retryCardIds]
    }
    retryCardIds = retryCardIds ? retryCardIds.map(Number).filter(Boolean) : null
    let cards = deck.cards ? deck.cards.map((card: any) => card.toJSON()) : [];
    if (retryCardIds && retryCardIds.length > 0) {
      cards = cards.filter((card: any) => retryCardIds.includes(card.id))
    }
    const questionIndex = parseInt(params.questionIndex, 10);
    const startTime = request.input('startTime');
    const results = request.input('results', '[]');
    const mode = request.input('mode', 'chronometre');
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')

    // Correction : si plus de cartes à réviser, on termine l'exercice
    if (cards.length === 0) {
      return view.render('finish_with_time', {
        deck,
        cards: [],
        elapsedTime: 0,
        results: [],
        mode,
        incorrectCards: [],
        showRetry: false,
        retryCardIds: []
      });
    }

    if (questionIndex >= cards.length) {
      // Correction : on termine l'exercice proprement au lieu de 404
      return view.render('finish_with_time', {
        deck,
        cards,
        elapsedTime: 0,
        results: [],
        mode,
        incorrectCards: [],
        showRetry: false,
        retryCardIds: []
      });
    }

    const card = cards[questionIndex];
    return view.render('present_question_with_time', { deck, cards, card, questionIndex, startTime, results, mode, retryCardIds, attempts, direction });
  }

  async finish({ params, request, view, auth }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards' as any).first();
    if (!deck) {
      return view.render('./pages/errors/not_found');
    }

    const mode = request.input('mode', 'chronometre');
    const elapsedTime = parseInt(request.input('elapsedTime', '0'), 10);
    const results = JSON.parse(request.input('results', '[]'));
    let retryCardIds = request.input('retryCardIds', null)
    if (retryCardIds && !Array.isArray(retryCardIds)) {
      retryCardIds = [retryCardIds]
    }
    retryCardIds = retryCardIds ? retryCardIds.map(Number).filter(Boolean) : null
    let cards = deck.cards ? deck.cards.map((card: any) => card) : []
    let filteredCards = cards
    if (retryCardIds && retryCardIds.length > 0) {
      filteredCards = cards.filter((card: any) => retryCardIds.includes(card.id))
    }
    const incorrectCards = filteredCards.filter((card: any) => !results.includes(card.id));
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')
    if (mode === 'jusquaubout' && incorrectCards.length > 0) {
      // On incrémente le nombre de passages pour le prochain tour
      return view.render('finish_with_time', {
        deck,
        cards: filteredCards,
        elapsedTime,
        results,
        mode,
        incorrectCards,
        showRetry: true,
        retryCardIds: incorrectCards.map(card => card.id),
        attempts: attempts + 1,
        direction
      });
    }

    return view.render('finish_with_time', {
      deck,
      cards: filteredCards,
      elapsedTime,
      results,
      mode,
      incorrectCards,
      showRetry: false,
      retryCardIds: [],
      attempts,
      direction,
      user: auth.user  // Ajout de l'utilisateur authentifié
    });
    };
  }

