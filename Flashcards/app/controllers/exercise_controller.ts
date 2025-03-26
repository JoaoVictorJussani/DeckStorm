import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class ExerciseController {
  async start({ params, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first()
    return view.render('start', { deck })
  }

  async presentQuestion({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first();
    const questionIndex = parseInt(params.questionIndex, 10);
    const mode = request.input('mode', 'timed'); // Default to "timed" mode
    let startTime = request.input('startTime'); // Pass start time for elapsed time calculation

    if (!deck || questionIndex >= deck.cards.length) {
      return view.render('./pages/errors/not_found');
    }

    const card = deck.cards[questionIndex];

    // Initialize startTime if not provided
    if (mode === 'timed' && !startTime) {
      startTime = Date.now();
    }

    if (mode === 'timed') {
      return view.render('present_question_with_time', { deck, card, questionIndex, startTime });
    } else {
      return view.render('present_question_basic', { deck, card, questionIndex });
    }
  }

  async finish({ params, request, response, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first();
    if (!deck) {
      return response.redirect().toRoute('home');
    }

    const mode = request.input('mode', 'timed');
    if (mode === 'basic') {
      return response.redirect().toRoute('decks.show', { id: deck.id });
    }

    const elapsedTime = parseInt(request.input('elapsedTime', '0'), 10);
    const results = JSON.parse(request.input('results', '[]'));

    return view.render('finish_with_time', { deck, elapsedTime, results });
  }
}
