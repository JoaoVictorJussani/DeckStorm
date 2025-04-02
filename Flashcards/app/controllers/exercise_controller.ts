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
    const startTime = request.input('startTime');
    const results = request.input('results', '[]'); // Retrieve accumulated results
    const mode = request.input('mode', 'chronometre'); // Retrieve mode

    if (!deck || questionIndex >= deck.cards.length) {
      return view.render('./pages/errors/not_found');
    }

    const card = deck.cards[questionIndex];
    return view.render('present_question_with_time', { deck, card, questionIndex, startTime, results, mode });
  }

  async finish({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first();
    if (!deck) {
      return view.render('./pages/errors/not_found');
    }

    const mode = request.input('mode', 'chronometre'); // Retrieve mode
    const elapsedTime = parseInt(request.input('elapsedTime', '0'), 10); // Parse elapsed time
    const results = JSON.parse(request.input('results', '[]')); // Parse results array

    const incorrectCards = deck.cards.filter((card) => !results.includes(card.id)); // Identify incorrect cards

    return view.render('finish_with_time', { deck, elapsedTime, results, mode, incorrectCards });
  }
}
