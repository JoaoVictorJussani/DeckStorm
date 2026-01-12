import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'
import type Card from '#models/card'
import UserStats from '#models/user_stats'
import { v4 as uuidv4 } from 'uuid'

export default class ExerciseController {
  async start({ params, view, request, auth, session }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').preload('user').first()
    if (!deck) {
      return view.render('./pages/errors/not_found')
    }
    // Pour le mode jusqu'au bout, possibilité de passer une liste de cartes à réviser
    let retryCardIds = request.input('retryCardIds', null)
    if (retryCardIds && !Array.isArray(retryCardIds)) {
      retryCardIds = [retryCardIds]
    }
    retryCardIds = retryCardIds ? retryCardIds.map(Number).filter(Boolean) : null
    let cards: Card[] = deck.cards as unknown as Card[]
    if (retryCardIds && retryCardIds.length > 0) {
      cards = cards.filter((card: Card) => retryCardIds!.includes(card.id))
    }
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')
    const user = auth?.user // Ajout de l'utilisateur authentifié

    // Vérifier la limite de tentatives si elle existe
    if (user && deck.attempt_limit !== null) {
      const ExerciseAttempt = (await import('#models/exercise_attempt')).default

      const attemptsDates = await ExerciseAttempt.query()
        .where('user_id', user.id)
        .where('deck_id', deck.id)
        .orderBy('created_at', 'asc')
        .select('created_at')

      let sessionCount = 0
      if (attemptsDates.length > 0) {
        sessionCount = 1
        for (let i = 1; i < attemptsDates.length; i++) {
          const prev = attemptsDates[i - 1].createdAt
          const curr = attemptsDates[i].createdAt
          const diff = curr.diff(prev, 'minutes').minutes
          if (diff >= 1) { // Même seuil que le rapport (1 minute)
            sessionCount++
          }
        }
      }

      if (sessionCount >= deck.attempt_limit) {
        return view.render('pages/errors/limit_reached', { deck })
      }
    }

    // Generate and store a unique token for this exercise session
    const exerciseToken = uuidv4()
    if (user) {
      session.put(`exercise_token_${Number(deck.id)}`, exerciseToken)
    }

    return view.render('start', { deck, cards, retryCardIds, attempts, direction, user, exerciseToken })
  }

  async presentQuestion({ params, request, view }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first();
    if (!deck) {
      return view.render('./pages/errors/not_found');
    }
    let retryCardIds = request.input('retryCardIds', null)
    if (retryCardIds && !Array.isArray(retryCardIds)) {
      retryCardIds = [retryCardIds]
    }
    retryCardIds = retryCardIds ? retryCardIds.map(Number).filter(Boolean) : null
    let cards = deck.cards as unknown as Card[];
    if (retryCardIds && retryCardIds.length > 0) {
      cards = (cards as Card[]).filter((card: Card) => retryCardIds!.includes(card.id));
    }
    const questionIndex = parseInt(params.questionIndex, 10);
    const startTime = request.input('startTime');
    const results = request.input('results', '[]');
    const mode = request.input('mode', 'chronometre');
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')
    const exerciseToken = request.input('exerciseToken')

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
        retryCardIds: [],
        exerciseToken
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
        retryCardIds: [],
        exerciseToken
      });
    }

    const card = cards[questionIndex];

    let quizOptions: any[] = []
    if (request.input('mode') === 'quiz') {
      const correctText = direction === 'question' ? card.answer : card.question
      quizOptions.push({ text: correctText, isCorrect: true })

      const distractors = (deck.cards as unknown as Card[]).filter(c => c.id !== card.id)

      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }

      const wrong = distractors.slice(0, 3)
      wrong.forEach(w => {
        const wrongText = direction === 'question' ? w.answer : w.question
        if (!quizOptions.find(o => o.text === wrongText)) {
          quizOptions.push({ text: wrongText, isCorrect: false })
        }
      })

      for (let i = quizOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizOptions[i], quizOptions[j]] = [quizOptions[j], quizOptions[i]];
      }
    }

    return view.render('present_question_with_time', { deck, cards, card, questionIndex, startTime, results, mode, retryCardIds, attempts, direction, quizOptions, exerciseToken });
  }

  async finish({ params, request, view, auth, session, response }: HttpContext) {
    const deck = await Deck.query().where('id', params.deckId).preload('cards').first();
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
    let cards = deck.cards as unknown as Card[]
    if (retryCardIds && retryCardIds.length > 0) {
      cards = cards.filter((card: Card) => retryCardIds!.includes(card.id))
    }
    const incorrectCards = cards.filter((card: Card) => !results.includes(card.id));
    let attempts = parseInt(request.input('attempts', '1'), 10) || 1
    const direction = request.input('direction', 'question')
    const exerciseToken = request.input('exerciseToken')

    // --- MISE À JOUR DES STATISTIQUES UTILISATEUR ET SAUVEGARDE DES TENTATIVES ---
    if (auth.user) {
      // Validate Token
      const sessionToken = session.get(`exercise_token_${Number(deck.id)}`)

      // If we are strictly checking attempts, we should enforce token matching
      if (deck.attempt_limit !== null) {
        if (!exerciseToken || !sessionToken || exerciseToken !== sessionToken) {
          session.flash('error', 'Session invalide ou expirée. Veuillez recommencer.')
          // If token mismatch, it might mean another tab started a session later or concurrent access.
          return response.redirect().toRoute('home')
        }

        // Consume token to prevent replay or multi-submission
        session.forget(`exercise_token_${Number(deck.id)}`)
      }

      const userId = auth.user.id;
      let userStats = await UserStats.findBy('user_id', userId);
      if (!userStats) {
        userStats = new UserStats();
        userStats.user_id = userId;
        userStats.decks_studied = 0;
        userStats.correct_answers = 0;
        userStats.wrong_answers = 0;
        userStats.total_study_time = 0;
      }

      // On met à jour les stats cumulatives
      userStats.correct_answers += results.length;
      userStats.wrong_answers += incorrectCards.length;
      userStats.total_study_time += isNaN(elapsedTime) ? 0 : elapsedTime;

      // On incrémente decks_studied seulement si l'exercice est terminé (pas de retry ou hors mode jusquaubout)
      if (mode !== 'jusquaubout' || incorrectCards.length === 0) {
        userStats.decks_studied += 1;
      }

      await userStats.save();

      // --- SAVE EXERCISE ATTEMPTS (For Reports) ---
      const attemptsToCreate: any[] = [];
      const ExerciseAttempt = (await import('#models/exercise_attempt')).default;

      // Correct answers
      for (const cardId of results) {
        attemptsToCreate.push({
          userId: userId,
          deckId: deck.id,
          cardId: Number(cardId),
          isCorrect: true,
        });
      }

      // Incorrect answers
      for (const card of incorrectCards) {
        attemptsToCreate.push({
          userId: userId,
          deckId: deck.id,
          cardId: card.id,
          isCorrect: false,
        });
      }

      if (attemptsToCreate.length > 0) {
        await ExerciseAttempt.createMany(attemptsToCreate);
      }
      // ---------------------------------------------
    }
    // --- FIN MISE À JOUR DES STATISTIQUES ---

    if (mode === 'jusquaubout' && incorrectCards.length > 0) {
      // On incrémente le nombre de passages pour le prochain tour
      return view.render('finish_with_time', {
        deck,
        cards,
        elapsedTime,
        results,
        mode,
        incorrectCards,
        showRetry: true,
        retryCardIds: incorrectCards.map((card: Card) => card.id),
        attempts: (attempts as number) + 1,
        direction,
        exerciseToken
      });
    }

    return view.render('finish_with_time', {
      deck,
      cards,
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
  }
}
