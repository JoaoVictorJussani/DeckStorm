/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
| 
*/
import AuthController from '#controllers/auth_controller'
import PageController from '#controllers/page_controller'
import DeckController from '#controllers/deck_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import Deck from '#models/deck'
import CardController from '#controllers/card_controller' // Fix the import path
import Card from '#models/card'; // Ensure the Card model is imported
import ExerciseController from '#controllers/exercise_controller' // New controller for exercises


//http://localhost:3333/
router
  .get('/', [PageController, 'home']) // Utilise le contrôleur
  .use(middleware.auth()) // Vérifie que l'utilisateur est authentifié
  .as('home')


//http://localhost:3333/login
router.get('/login', async ({ view }) => {
  return view.render('auth/login')
})

//http://localhost:3333/register
router.get('/register', async ({ view }) => {
  return view.render('auth/register')
})

router
  .post('/register', [AuthController, 'handleRegister'])
  .as('auth.handleRegister')
  .use(middleware.guest())



// Route pour afficher la page d'édition d'un deck
router
  .get('/deck/:id/edit', async ({ params, view, auth, response }) => {
    const deck = await Deck.find(params.id);
    if (deck && deck.user_id === auth.user.id) { // Ensure the user owns the deck
      return view.render('edit_deck', { deck, user: auth.use('web').user });
    }
    return response.redirect().toRoute('home'); // Redirect if the user does not own the deck
  })
  .as('decks.edit')
  .use(middleware.auth())

// Route pour mettre à jour un deck
router
  .post('/deck/:id/update', [DeckController, 'update'])
  .as('decks.update')
  .use(middleware.auth())

// Route pour supprimer un deck
router
  .post('/deck/:id/delete', [DeckController, 'destroy'])
  .as('decks.delete')
  .use(middleware.auth())

router
  .post('/login', [AuthController, 'handleLogin'])
  .as('auth.handleLogin')
  .use(middleware.guest())

// http://localhost:3333/logout
router
  .post('/logout', [AuthController, 'handleLogout'])
  .as('auth.handleLogout')
  .use(middleware.auth())

// Deck routes
// Route pour afficher la page de création d'un deck
router
  .get('/deck/create', async ({ view, auth }) => {
    return view.render('deck', { user: auth.use('web').user }) // Pass the authenticated user to the view
  })
  .as('decks.create')
  .use(middleware.auth()) // Add auth middleware

// Route pour afficher un deck spécifique
router
  .get('/deck/:id', async ({ params, view, auth }) => {
    const deck = await Deck.query()
      .where('id', params.id)
      .andWhere((query) => {
        query.where('user_id', auth.user.id).orWhere('visibility', 'public'); // Allow access to public decks
      })
      .preload('cards') // Preload cards
      .preload('user') // Preload the user relationship
      .first();

    if (deck) {
      return view.render('show_deck', { deck, user: auth.use('web').user });
    } else {
      return view.render('./pages/errors/not_found'); // Render 404 page if deck is not found
    }
  })
  .as('decks.show')
  .use(middleware.auth())

// Route pour abandonner la création d'un deck
router
  .get('/deck/abandon', async ({ response }) => {
    return response.redirect().toRoute('home')
  })
  .as('decks.abandon')

// Routes pour la gestion des decks
// Route pour enregistrer un nouveau deck en base de données
router
  .post('/decks', [DeckController, 'store'])
  .as('decks.store')
  .use(middleware.auth()) // Add auth middleware

// Card routes
router
  .get('/deck/:deckId/card/create', [CardController, 'create'])
  .as('cards.create')
  .use(middleware.auth())

router
  .post('/deck/:deckId/card', [CardController, 'store'])
  .as('cards.store')
  .use(middleware.auth())

router
  .get('/deck/:deckId/card/:cardId', [CardController, 'show'])
  .as('cards.show')
  .use(middleware.auth())

router
  .get('/deck/:deckId/card/:cardId/edit', async ({ params, view, auth, response }) => {
    const deck = await Deck.find(params.deckId);
    if (deck && deck.user_id === auth.user.id) { // Ensure the user owns the deck
      const card = await Card.find(params.cardId);
      if (card) {
        return view.render('edit_card', { card, deck });
      }
    }
    return response.redirect().toRoute('home'); // Redirect if the user does not own the deck or card
  })
  .as('cards.edit')
  .use(middleware.auth());

router
  .post('/deck/:deckId/card/:cardId/update', [CardController, 'update'])
  .as('cards.update')
  .use(middleware.auth())

router
  .post('/deck/:deckId/card/:cardId/delete', async ({ params, auth, response, session }) => {
    const deck = await Deck.find(params.deckId);
    if (deck && deck.user_id === auth.user.id) { // Ensure the user owns the deck
      const card = await Card.find(params.cardId);
      if (card) {
        await card.delete();
        session.flash('success', 'Carte supprimée avec succès.');
        return response.redirect().toRoute('decks.show', { id: deck.id });
      }
    }
    session.flash('error', 'Vous ne pouvez pas supprimer cette carte.');
    return response.redirect().toRoute('home'); // Redirect if the user does not own the deck or card
  })
  .as('cards.delete')
  .use(middleware.auth());

// Exercise routes
router
  .get('/deck/:deckId/start', [ExerciseController, 'start'])
  .as('exercise.start')
  .use(middleware.auth())

router
  .get('/deck/:deckId/question/:questionIndex', [ExerciseController, 'presentQuestion'])
  .as('exercise.presentQuestion')
  .use(middleware.auth())

router
  .post('/deck/:deckId/finish', [ExerciseController, 'finish']) // Change to POST
  .as('exercise.finish')
  .use(middleware.auth())

router
  .get('/search', [PageController, 'searchPublicDecks'])
  .as('search.publicDecks')
  .use(middleware.auth());
