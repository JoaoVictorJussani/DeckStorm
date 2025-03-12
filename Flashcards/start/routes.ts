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
  .get('/deck/:id/edit', async ({ params, view, auth }) => {
    const deck = await Deck.find(params.id)
    if (deck) {
      return view.render('edit_deck', { deck, user: auth.use('web').user })
    } else {
      return view.render('./pages/errors/not_found')
    }
  })
  .as('decks.edit')
  .use(middleware.auth())

// Route pour mettre à jour un deck
router
  .post('/deck/:id/update', async ({ params, request, response, session }) => {
    const deck = await Deck.find(params.id)
    if (deck) {
      const data = request.only(['title', 'description'])
      deck.merge(data)
      await deck.save()
      session.flash('success', 'Deck mis à jour avec succès !')
      return response.redirect().toRoute('home')
    } else {
      session.flash('error', 'Deck non trouvé')
      return response.redirect().toRoute('home')
    }
  })
  .as('decks.update')
  .use(middleware.auth())

// Route pour supprimer un deck
router
  .post('/deck/:id/delete', async ({ params, response, session }) => {
    const deck = await Deck.find(params.id)
    if (deck) {
      await deck.delete()
      session.flash('success', 'Deck supprimé avec succès !')
      return response.redirect().toRoute('home')
    } else {
      session.flash('error', 'Deck non trouvé')
      return response.redirect().toRoute('home')
    }
  })
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
    const deck = await Deck.find(params.id)
    if (deck) {
      return view.render('show_deck', { deck, user: auth.use('web').user })
    } else {
      return view.render('./pages/errors/not_found')
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
  .post('/decks', async ({ request, response, session, auth }) => {
    const data = request.only(['title', 'description'])
    const existingDeck = await Deck.findBy('title', data.title)

    if (existingDeck) {
      session.flash('error', 'Un deck avec ce titre existe déjà.')
      return response.redirect().toRoute('home')
    }

    if (data.description.length < 10) {
      session.flash('error', 'La description doit contenir au moins 10 caractères.')
      return response.redirect().toRoute('home')
    }

    const deck = new Deck()
    deck.title = data.title
    deck.description = data.description
    if (auth.user) {
      deck.user_id = auth.user.id
    } else {
      return response.unauthorized('User not authenticated')
    }

    await deck.save()

    session.flash('success', 'Deck créé avec succès !')
    return response.redirect().toRoute('home')
  })
  .as('decks.store')
  .use(middleware.auth()) // Add auth middleware
