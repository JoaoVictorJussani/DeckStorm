import type { HttpContext } from '@adonisjs/core/http'; // Type pour le contexte HTTP
import Deck from '#models/deck'; // Importation du modèle Deck
import Follow from '#models/follow'
import User from '#models/user'

export default class PageController {
  // Méthode pour afficher la page d'accueil
  async home({ view, auth }: HttpContext) {
    const user = auth.use('web').user;

    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards')
      .preload('user')
      .preload('likes')
      .exec();

    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .preload('cards')
      .preload('user')
      .preload('likes')
      .exec();

    // Transform each deck to include hasLiked status
    const decksWithLikeStatus = publicDecks.map(deck => ({
      ...deck.toJSON(),
      hasLiked: deck.likes?.some(like => like.user_id === user.id) || false,
      likesCount: deck.likes?.length || 0
    }));

    return view.render('home', { 
      user, 
      userDecks, 
      publicDecks: decksWithLikeStatus 
    });
  }

  // Méthode pour rechercher des decks publics
  async searchPublicDecks({ request, view, auth }: HttpContext) {
    const user = auth.use('web').user;
    const query = request.input('query', '').trim();

    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards')
      .preload('user')
      .preload('likes', (likesQuery) => {
        likesQuery.preload('user')
      });

    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhereNot('user_id', user.id)
      .andWhere('title', 'like', `%${query}%`)
      .preload('cards')
      .preload('user')
      .preload('likes')
      .exec();

    // Transform each deck to include hasLiked status
    const decksWithLikeStatus = publicDecks.map(deck => ({
      ...deck.toJSON(),
      hasLiked: deck.likes?.some(like => like.user_id === user.id) || false,
      likesCount: deck.likes?.length || 0
    }));

    return view.render('home', { 
      user, 
      userDecks, 
      publicDecks: decksWithLikeStatus,
      query 
    });
  }

  // Ajout : Méthode pour la page "Mon compte" avec followersList/followingList
  async account({ params, view, auth }) {
    // Si l'utilisateur connecté n'est pas celui demandé, refuse l'accès
    if (!auth.user || auth.user.id !== Number(params.id)) {
      return view.render('./pages/errors/not_found');
    }
    const user = auth.user;
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards')
      .preload('user');
    // Ajout des compteurs d'abonnés/abonnements et des listes
    const followers = await Follow.query().where('following_id', user.id).preload('follower');
    const following = await Follow.query().where('follower_id', user.id).preload('following');
    // Extraction des utilisateurs
    const followersList = followers.map(f => f.follower);
    const followingList = following.map(f => f.following);
    return view.render('account', {
      user,
      userDecks,
      followersCount: followers.length,
      followingCount: following.length,
      followersList,
      followingList,
    });
  }

  // Ajout : Méthode pour le profil public avec followersList/followingList
  async publicAccount({ params, view, auth }) {
    if (!auth.user) {
      return view.render('./pages/errors/not_found');
    }
    const user = await User.find(params.id);
    if (!user) {
      return view.render('./pages/errors/not_found');
    }
    const publicDecks = await Deck.query()
      .where('user_id', user.id)
      .andWhere('visibility', 'public')
      .preload('cards')
      .preload('user');
    // Followers/following count et listes
    const followers = await Follow.query().where('following_id', user.id).preload('follower');
    const following = await Follow.query().where('follower_id', user.id).preload('following');
    const followersList = followers.map(f => f.follower);
    const followingList = following.map(f => f.following);
    let isFollowing = false;
    if (auth.user.id !== user.id) {
      isFollowing = !!(await Follow.query()
        .where('follower_id', auth.user.id)
        .andWhere('following_id', user.id)
        .first());
    }
    return view.render('public_account', {
      user,
      publicDecks,
      authUser: auth.user,
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing,
      followersList,
      followingList,
    });
  }
}
