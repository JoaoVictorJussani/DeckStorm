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
    const startTime = request.input('startTime') // Pass start time for elapsed time calculation

    if (!deck || questionIndex >= deck.cards.length) {
      return view.render('./pages/errors/not_found')
    }

    const card = deck.cards[questionIndex]
    return view.render('present_question_with_time', { deck, card, questionIndex, startTime })
  }

  async finish({ params, request, view }: HttpContext) {
    const deck = await Deck.find(params.deckId)
    const elapsedTime = request.input('elapsedTime')
    const results = request.input('results') // Collect results from the session

    return view.render('finish_with_time', { deck, elapsedTime, results })
  }
}
