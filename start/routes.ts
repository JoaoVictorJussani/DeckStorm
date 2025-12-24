/*
|---------------------------------------------------------------------------
| Fichier des routes
|---------------------------------------------------------------------------
| Ce fichier est utilisé pour définir les routes HTTP.
*/

import AuthController from '#controllers/auth_controller'; // Contrôleur pour l'authentification
import PageController from '#controllers/page_controller'; // Contrôleur pour les pages
import DeckController from '#controllers/deck_controller'; // Contrôleur pour les decks
import router from '@adonisjs/core/services/router'; // Service de routage
import { middleware } from './kernel.js'; // Middleware
import Deck from '#models/deck'; // Modèle Deck
import CardController from '#controllers/card_controller'; // Contrôleur pour les cartes
import Card from '#models/card'; // Modèle Card
import ExerciseController from '#controllers/exercise_controller'; // Contrôleur pour les exercices
import FollowController from '#controllers/follow_controller'; // Contrôleur pour le suivi
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'; // Import du type HttpContext

// Route pour la page d'accueil
router
  .get('/', [PageController, 'home']) // Utilise le contrôleur PageController
  .use(middleware.auth()) // Vérifie que l'utilisateur est authentifié
  .as('home');

// Route pour la page de connexion
router.get('/login', async ({ view }) => {
  return view.render('auth/login'); // Affiche la vue de connexion
});

// Route pour la page d'inscription
router.get('/register', async ({ view }) => {
  return view.render('auth/register'); // Affiche la vue d'inscription
});

// Route pour gérer l'inscription
router
  .post('/register', [AuthController, 'handleRegister'])
  .as('auth.handleRegister')
  .use(middleware.guest()); // Accessible uniquement aux invités

// Route pour afficher la page d'édition d'un deck
router
  .get('/deck/:id/edit', async ({ params, view, auth, response }) => {
    const deck = await Deck.find(params.id); // Récupère le deck par ID
    if (deck && auth.user && deck.user_id === auth.user.id) { // Vérifie que l'utilisateur est le propriétaire
      return view.render('edit_deck', { deck, user: auth.use('web').user });
    }
    return response.redirect().toRoute('home'); // Redirige si l'utilisateur n'est pas le propriétaire
  })
  .as('decks.edit')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour mettre à jour un deck
router
  .post('/deck/:id/update', [DeckController, 'update'])
  .as('decks.update')
  .use(middleware.auth());

// Route pour supprimer un deck
router
  .post('/deck/:id/delete', [DeckController, 'destroy'])
  .as('decks.delete')
  .use(middleware.auth());

// Route pour gérer la connexion
router
  .post('/login', [AuthController, 'handleLogin'])
  .as('auth.handleLogin')
  .use(middleware.guest());

// Route pour gérer la déconnexion
router
  .post('/logout', [AuthController, 'handleLogout'])
  .as('auth.handleLogout')
  .use(middleware.auth());

// Like/unlike routes - support both GET and POST for flexibility
router
  .get('/deck/:id/like', [DeckController, 'like'])
  .as('decks.like.get')
  .use(middleware.auth());

router
  .post('/deck/:id/like', [DeckController, 'like'])
  .as('decks.like')
  .use(middleware.auth());

router
  .get('/deck/:id/unlike', [DeckController, 'unlike'])
  .as('decks.unlike.get')
  .use(middleware.auth());

router
  .post('/deck/:id/unlike', [DeckController, 'unlike'])
  .as('decks.unlike')
  .use(middleware.auth());

// Route pour rechercher les decks publics (déplacer avant les routes avec paramètres dynamiques)
router
  .get('/deck/search', [PageController, 'searchPublicDecks'])
  .as('search.decks')
  .use(middleware.auth());

// Route pour afficher la page de création d'un deck
router
  .get('/deck/create', async ({ view, auth }) => {
    return view.render('deck', { user: auth.use('web').user }); // Passe l'utilisateur authentifié à la vue
  })
  .as('decks.create')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour afficher un deck spécifique
router
  .get('/deck/:id', async ({ params, view, auth, response }) => {
    const deck = await Deck.query()
      .where('id', params.id)
      .preload('cards') // Précharge les cartes
      .preload('user') // Précharge la relation utilisateur
      .preload('likes') // Précharger les likes
      .first();

    if (!deck) {
      return view.render('./pages/errors/not_found'); // Affiche une page 404 si le deck n'est pas trouvé
    }

    // Check visibility
    let isAllowed = false;
    if (deck.visibility === 'public') {
      isAllowed = true;
    } else if (auth.user) {
      if (deck.user_id === auth.user.id) {
        isAllowed = true;
      } else if (deck.visibility === 'restricted') {
        const allowed = deck.allowed_users_ids ?? [];
        if (allowed.includes(auth.user.id)) {
          isAllowed = true;
        }
      }
    }

    if (!isAllowed) {
      // If not allowed, redirect or show error
      // Maybe redirect to home with error
      return response.redirect().toRoute('home');
    }

    let hasLiked = false;
    if (auth.user) {
      hasLiked = !!deck.likes.find(like => auth.user && like.user_id === auth.user.id);
    }

    return view.render('show_deck', { deck, user: auth.use('web').user, hasLiked });
  })
  .as('decks.show')
  .use(middleware.auth());

// Route pour le rapport de deck
router
  .get('/deck/:id/report', [DeckController, 'report'])
  .as('decks.report')
  .use(middleware.auth());

// Route pour abandonner la création d'un deck
router
  .get('/deck/abandon', async ({ response }) => {
    return response.redirect().toRoute('home'); // Redirige vers la page d'accueil
  })
  .as('decks.abandon');

// Route pour enregistrer un nouveau deck en base de données
router
  .post('/decks', [DeckController, 'store'])
  .as('decks.store')
  .use(middleware.auth()); // Nécessite une authentification

// Routes pour les cartes
// Route pour afficher la page de création d'une carte
router
  .get('/deck/:deckId/card/create', [CardController, 'create'])
  .as('cards.create')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour enregistrer une nouvelle carte
router
  .post('/deck/:deckId/card', [CardController, 'store'])
  .as('cards.store')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour afficher une carte spécifique
router
  .get('/deck/:deckId/card/:cardId', [CardController, 'show'])
  .as('cards.show')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour afficher la page d'édition d'une carte
router
  .get('/deck/:deckId/card/:cardId/edit', [CardController, 'edit'])
  .as('cards.edit')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour mettre à jour une carte
router
  .post('/deck/:deckId/card/:cardId/update', [CardController, 'update'])
  .as('cards.update')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour supprimer une carte
router
  .post('/deck/:deckId/card/:cardId/delete', async ({ params, auth, response, session }) => {
    const deck = await Deck.find(params.deckId); // Récupère le deck par ID
    if (deck && auth.user && deck.user_id === auth.user.id) { // Vérifie que l'utilisateur est le propriétaire
      const card = await Card.find(params.cardId); // Récupère la carte par ID
      if (card) {
        await card.delete(); // Supprime la carte
        session.flash('success', 'Carte supprimée avec succès.');
        return response.redirect().toRoute('decks.show', { id: deck.id });
      }
    }
    session.flash('error', 'Vous ne pouvez pas supprimer cette carte.');
    return response.redirect().toRoute('home'); // Redirige si l'utilisateur n'est pas le propriétaire
  })
  .as('cards.delete')
  .use(middleware.auth()); // Nécessite une authentification

// Routes pour les exercices
// Route pour démarrer un exercice
router
  .get('/deck/:deckId/start', [ExerciseController, 'start'])
  .as('exercise.start')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour présenter une question
router
  .get('/deck/:deckId/question/:questionIndex', [ExerciseController, 'presentQuestion'])
  .as('exercise.presentQuestion')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour terminer un exercice
router
  .post('/deck/:deckId/finish', [ExerciseController, 'finish']) // Change à POST
  .as('exercise.finish')
  .use(middleware.auth()); // Nécessite une authentification

// Routes pour la recherche
// Route pour rechercher les decks de l'utilisateur
router
  .get('/search/user-decks', async ({ request, view, auth }: HttpContext) => {
    const user = auth.use('web').user; // Récupère l'utilisateur authentifié
    const userQuery = request.input('userQuery', '').trim(); // Récupère la requête de recherche

    // Recherche des decks de l'utilisateur correspondant à la requête
    const userDecks = await Deck.query()
      .where('user_id', user ? user.id : 0)
      .andWhere('title', 'like', `%${userQuery}%`)
      .preload('cards') // Précharge les cartes
      .preload('user'); // Précharge la relation utilisateur

    // Récupère tous les decks publics (non affectés par la recherche personnelle)
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user ? user.id : 0)
      .preload('cards') // Précharge les cartes
      .preload('user'); // Précharge la relation utilisateur

    return view.render('home', { user, userDecks, publicDecks, userQuery, publicQuery: '' });
  })
  .as('search.userDecks')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour rechercher les decks publics
router
  .get('/search', async ({ request, view, auth }: HttpContext) => {
    const user = auth.use('web').user; // Récupère l'utilisateur authentifié
    const publicQuery = request.input('publicQuery', '').trim(); // Récupère la requête de recherche

    // Récupère tous les decks personnels (non affectés par la recherche publique)
    interface UserDeck {
      id: number;
      title: string;
      cards: any[];
      user: any;
      [key: string]: any;
    }
    let userDecks: UserDeck[] = [];
    if (user) {
      userDecks = await Deck.query()
        .where('user_id', user.id)
        .preload('cards') // Précharge les cartes
        .preload('user'); // Précharge la relation utilisateur
    }

    // Recherche des decks publics correspondant à la requête
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user?.id ?? 0)
      .andWhere('title', 'like', `%${publicQuery}%`)
      .preload('cards') // Précharge les cartes
      .preload('user'); // Précharge la relation utilisateur

    return view.render('home', { user, userDecks, publicDecks, userQuery: '', publicQuery });
  })
  .as('search.publicDecks')
  .use(middleware.auth()); // Nécessite une authentification

// Route pour la page "Mon compte" (affiche mes decks et followers/following)
router
  .get('/account/:id', [PageController, 'account'])
  .as('account')
  .use(middleware.auth());

// Route pour changer le mot de passe
router.post('/account/:id/change-password', '#controllers/auth_controller.changePassword').use(middleware.auth())

// Route pour changer le nom d'utilisateur  
router.post('/account/:id/change-username', '#controllers/auth_controller.changeUsername').use(middleware.auth())

// Routes follow/unfollow
router
  .post('/user/:id/follow', [FollowController, 'follow'])
  .as('user.follow')
  .use(middleware.auth());

router
  .post('/user/:id/unfollow', [FollowController, 'unfollow'])
  .as('user.unfollow')
  .use(middleware.auth());

// Route pour profil public utilisateur (avec followers/following)
router
  .get('/public-account/:id', [PageController, 'publicAccount'])
  .as('publicAccount')
  .use(middleware.auth());

router.group(() => {
  // API routes for likes
  router
    .post('/api/decks/:id/like', '#controllers/deck_controller.apiLike')
    .as('api.decks.like')

  router
    .post('/api/decks/:id/unlike', '#controllers/deck_controller.apiUnlike')
    .as('api.decks.unlike')
}).use(middleware.auth())

// Route pour inviter un utilisateur à rejoindre un deck
router
  .post('/deck/:id/invite-user', [DeckController, 'inviteUser'])
  .as('decks.inviteUser')
  .use(middleware.auth()); // Nécessite une authentification

router.get('/api/user-suggestions', async ({ request, response }) => {
  const query = request.input('query', '').trim()
  if (!query || query.length < 1) return response.json([])
  const users = await User.query()
    .where('username', 'like', `%${query}%`)
    .limit(8)
    .select('username')
  return response.json(users.map(u => u.username))
})

// Aceitar convite para deck restrito
router.post('/deck/:id/accept-invite', async ({ params, auth, response, session }) => {
  // Verifica autenticação
  // Note: auth middleware ensures auth.user is set, checking it again is fine.
  const user = auth.user
  if (!user) return response.unauthorized('User not authenticated')

  const deckId = Number(params.id)
  const Deck = (await import('#models/deck')).default
  const Notification = (await import('#models/notification')).default

  const deck = await Deck.find(deckId)
  if (!deck || deck.visibility !== 'restricted') {
    session.flash('error', 'Deck non trouvé ou non restreint.')
    return response.redirect().back()
  }

  // Adiciona usuário à lista de autorizados se não estiver
  let allowed = deck.allowed_users_ids ?? []
  if (!allowed.includes(user.id)) {
    allowed.push(user.id)
    deck.allowed_users_ids = allowed
    await deck.save()
  }

  // Marca notificação como lida
  await Notification.query()
    .where('user_id', user.id)
    .where('type', 'invite')
    .andWhereRaw('message LIKE ?', [`%(ID:${deckId})%`])
    .update({ read: true })

  session.flash('success', 'Vous avez accepté l\'invitation pour ce deck.')
  return response.redirect(`/deck/${deckId}`)
}).use(middleware.auth())

// Recusar convite para deck restrito
router.post('/deck/:id/refuse-invite', async ({ params, auth, response, session }) => {
  const user = auth.user
  if (!user) return response.unauthorized('User not authenticated')

  const deckId = Number(params.id)
  const Notification = (await import('#models/notification')).default

  // Marca notificação como lida
  await Notification.query()
    .where('user_id', user.id)
    .where('type', 'invite')
    .andWhereRaw('message LIKE ?', [`%(ID:${deckId})%`])
    .update({ read: true })

  session.flash('success', 'Invitation refusée.')
  return response.redirect().back()
}).use(middleware.auth())