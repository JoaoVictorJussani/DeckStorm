import User from '#models/user'
import Deck from '#models/deck'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class DeckPolicy extends BasePolicy {
  public view(user: User, deck: Deck): AuthorizerResponse {
    if (deck.visibility === 'public') {
      return true
    }
    if (user.id === deck.user_id) {
      return true
    }
    if (deck.visibility === 'restricted') {
      return deck.allowed_users_ids?.includes(user.id) || false
    }
    return false
  }

  public edit(user: User, deck: Deck): AuthorizerResponse {
    return user.id === deck.user_id
  }

  public update(user: User, deck: Deck): AuthorizerResponse {
    return user.id === deck.user_id
  }

  public delete(user: User, deck: Deck): AuthorizerResponse {
    return user.id === deck.user_id
  }

  public create(_user: User): AuthorizerResponse {
    return true
  }
}
