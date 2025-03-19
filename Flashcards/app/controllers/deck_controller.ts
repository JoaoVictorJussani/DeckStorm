import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'

export default class DeckController {
  // Création d'un deck
  async store({ request, response, session, auth }: HttpContext) {
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
      session.flash('error', 'Utilisateur non authentifié.')
      return response.unauthorized('User not authenticated')
    }

    await deck.save()

    session.flash('success', 'Deck créé avec succès !')
    return response.redirect().toRoute('home')
  }

  // Mise à jour d'un deck
  async update({ params, request, response, session }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (deck) {
      const data = request.only(['title', 'description'])
      deck.merge(data)
      await deck.save()
      session.flash('success', 'Deck mis à jour avec succès !')
    } else {
      session.flash('error', 'Deck non trouvé.')
    }
    return response.redirect().toRoute('home')
  }

  // Suppression d'un deck
  async destroy({ params, response, session }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (deck) {
      await deck.delete()
      session.flash('success', 'Deck supprimé avec succès !')
    } else {
      session.flash('error', 'Deck non trouvé.')
    }
    return response.redirect().toRoute('home')
  }
}
