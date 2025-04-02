import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class ExerciseController {
  async start({ params, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first()
    return view.render('start', { deck })
  }

  async presentQuestion({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first()
    const questionIndex = parseInt(params.questionIndex, 10)
    const startTime = request.input('startTime')
    const results = request.input('results', '[]') // Retrieve accumulated results

    if (!deck || questionIndex >= deck.cards.length) {
      return view.render('./pages/errors/not_found')
    }

    const card = deck.cards[questionIndex]
    return view.render('present_question_with_time', { deck, card, questionIndex, startTime, results })
  }

  async finish({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first(); // Preload cards
    if (!deck) {
      return view.render('./pages/errors/not_found'); // Handle case where deck is not found
    }

    const mode = request.input('mode', 'chronometre'); // Retrieve mode
    const elapsedTime = parseInt(request.input('elapsedTime', '0'), 10); // Parse elapsed time
    const results = JSON.parse(request.input('results', '[]')); // Parse results array

    if (mode === 'basique') {
      return view.render('finish_basic', { deck, results }); // Render view without time
    }

    return view.render('finish_with_time', { deck, elapsedTime, results, mode });
  }
}
