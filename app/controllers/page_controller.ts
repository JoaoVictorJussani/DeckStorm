import type { HttpContext } from '@adonisjs/core/http'; // Type pour le contexte HTTP
import { DateTime } from 'luxon';
import Deck from '#models/deck'; // Importation du modèle Deck
import Follow from '#models/follow'
import User from '#models/user'
import Like from '#models/like'

export default class PageController {
  // Méthode pour afficher la page d'accueil
  async home({ view, auth }: HttpContext) {
    const user = auth.use('web').user;

    // Get current date in UTC+2
    const now = DateTime.now().setZone('UTC+2')
    const seed = now.toFormat('yyyyLLdd') // Use date as seed for random selection

    // Get deck of the day (using date as seed for consistent daily selection)
    const deckOfTheDay = await Deck.query()
      .where('visibility', 'public')
      .preload('cards' as any)
      .preload('user' as any)
      .preload('likes' as any)
      .orderByRaw('RAND(?)', [parseInt(seed)])
      .first();

    // Get top 10 most liked decks
    const topLikedDecks = await Deck.query()
      .where('visibility', 'public')
      .preload('cards' as any)
      .preload('user' as any)
      .preload('likes' as any)
      .withCount('likes'  as any)
      .orderBy('likes_count', 'desc')
      .limit(10);

    // Get top 5 creators by followers count
    const topCreatorsByFollowers = await User.query()
      .withCount('followers'  as any)
      .orderBy('followers_count', 'desc')
      .limit(5);

    // Get top 5 creators by deck count
    const topCreatorsByDecks = await User.query()
      .withCount('decks'  as any, (query) => {
      query.where('visibility', 'public');
      })
      .whereHas('decks'  as any, (query) => {
      query.where('visibility', 'public');
      })
      .orderBy('decks_count', 'desc')
      .limit(5);

    return view.render('home', { 
      user,
      topLikedDecks,
      topCreatorsByFollowers,
      topCreatorsByDecks,
      deckOfTheDay
    });
  }

  // Méthode pour rechercher des decks publics
  async searchPublicDecks({ request, view, auth }: HttpContext) {
    const user = auth.use('web').user;
    const query = request.input('q', '').trim();

    // Recherche des decks publics correspondant à la requête
    const publicDecks = await Deck.query()
      .where('visibility', 'public')
      .andWhere((builder) => {
        builder
          .where('title', 'like', `%${query}%`)
          .orWhere('description', 'like', `%${query}%`)
          .orWhereHas('user'  as any, (userQuery) => {
            userQuery.where('username', 'like', `%${query}%`);
          });
      })
      .preload('cards')
      .preload('user'  as any)
      .preload('likes'  as any)
      .exec();

    interface SerializedDeck {
      [key: string]: any;
      hasLiked: boolean;
    }

    const decksWithLikeStatus: SerializedDeck[] = publicDecks.map((deck: Deck) => ({
      ...deck.serialize(),
      hasLiked: deck.likes?.some((like: Like) => like.user_id === user?.id) || false,
    }));

    return view.render('result_search', { 
      user,
      publicDecks: decksWithLikeStatus,
      query 
    });
  }

  // Ajout : Méthode pour la page "Mon compte" avec followersList/followingList
  async account({ params, view, auth }: HttpContext) {
    // Si l'utilisateur connecté n'est pas celui demandé, refuse l'accès
    if (!auth.user || auth.user.id !== Number(params.id)) {
      return view.render('./pages/errors/not_found');
    }
    const user = auth.user;
    const userDecks = await Deck.query()
      .where('user_id', user.id)
      .preload('cards')
      .preload('user'  as any);
    // Decks likés
    const likedDecks = await Deck.query()
      .whereIn('id', (await Like.query().where('user_id', user.id)).map(like => like.deck_id))
      .preload('cards')
      .preload('user'  as any);
    // Ajout des compteurs d'abonnés/abonnements et des listes
    const followers = await Follow.query().where('following_id', user.id).preload('follower'  as any);
    const following = await Follow.query().where('follower_id', user.id).preload('following'  as any);
    // Extraction des utilisateurs
    const followersList = followers.map(f => f.follower);
    const followingList = following.map(f => f.following);
    return view.render('account', {
      user,
      userDecks,
      likedDecks,
      followersCount: followers.length,
      followingCount: following.length,
      followersList,
      followingList,
    });
  }

  // Ajout : Méthode pour le profil public avec followersList/followingList
  async publicAccount({ params, view, auth }: HttpContext) {
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
      .preload('user'  as any);
    // Followers/following count et listes
    const followers = await Follow.query().where('following_id', user.id).preload('follower'  as any);
    const following = await Follow.query().where('follower_id', user.id).preload('following'  as any);
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

  // Ajout : méthode pour afficher un deck (show_deck.edge)
  async showDeck({ params, view, auth }: HttpContext) {
    const deck = await Deck.query()
      .where('id', params.id)
      .preload('user'  as any)
      .preload('likes'  as any)
      .first()
    if (!deck) {
      return view.render('./pages/errors/not_found')
    }
    const user = auth.user
    interface LikeType {
      user_id: number;
      [key: string]: any;
    }
    const hasLiked: boolean = !!deck.likes?.find((like: LikeType) => like.user_id === user?.id);
    const likesCount = deck.likes?.length || 0
    return view.render('show_deck', {
      deck,
      user,
      hasLiked,
      likesCount,
    })
  }
}
