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

// Route pour afficher un deck spécifique
router.get('/deck/:id', async ({ params, view }) => {
  // Récupérer le deck à partir de la base de données en utilisant l'ID
  const deck = await Deck.find(params.id)
  
  // Si le deck existe, renvoyer la vue avec les données du deck
  if (deck) {
    return view.render('show_deck', { deck })
  } else {
    // Si le deck n'est pas trouvé, rediriger vers une page d'erreur ou l'accueil
    return view.render('errors.notFound')
  }
})



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
// Cette route sert à afficher le formulaire de création de deck
router.get('/deck/create', async ({ view }) => {
  return view.render('deck');
}).as('decks.create');

// Routes pour la gestion des decks
// Route pour enregistrer un nouveau deck en base de données
router
  .post('/decks', [DeckController, 'store']) // Cette route est appelée quand on soumet le formulaire
  .as('decks.store');
