import type { HttpContext } from '@adonisjs/core/http'
import Card from '#models/card' // Modèle des cartes
import Deck from '#models/deck' // Modèle des decks

export default class CardController {
  // Affiche la page pour créer une nouvelle carte
  async create({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate()
    const deck = await Deck.find(params.deckId) // Récupère le deck par ID
    const user = auth.user // Ajout : récupérer l'utilisateur connecté
    return view.render('newcard', { deck, user }) // Passer user à la vue
  }

  // Enregistre une nouvelle carte
  async store({ params, request, response, session, auth, i18n }: HttpContext) {
    await auth.use('web').authenticate()
    const cardType = request.input('card_type', 'text')

    // Gestion des cartes d'occlusion d'image
    if (cardType === 'image_occlusion') {
      const image = request.file('occlusion_image', {
        size: '10mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })

      if (!image) {
        session.flash('error', i18n.t('card.image_required'))
        return response.redirect().back()
      }

      const occlusionZonesJson = request.input('occlusion_zones')
      if (!occlusionZonesJson) {
        session.flash('error', i18n.t('card.occlusion_zones_required'))
        return response.redirect().back()
      }

      let occlusionZones
      try {
        occlusionZones = JSON.parse(occlusionZonesJson)
        if (!Array.isArray(occlusionZones) || occlusionZones.length === 0) {
          session.flash('error', i18n.t('card.occlusion_zones_invalid'))
          return response.redirect().back()
        }
      } catch (error) {
        session.flash('error', i18n.t('card.occlusion_zones_invalid'))
        return response.redirect().back()
      }

      // Lire l'image et la convertir en Base64
      const fs = await import('node:fs/promises')
      const imageBuffer = await fs.readFile(image.tmpPath!)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = image.type || 'image/png'

      // Créer un Data URL pour stocker dans la DB
      const imageDataUrl = `data:${mimeType};base64,${base64Image}`

      // Créer la carte d'occlusion d'image
      const questionValue = (request.input('question') || '').trim()
      await Card.create({
        question: questionValue || 'Image Occlusion',
        answer: request.input('answer') || '-',
        deckId: params.deckId,
        cardType: 'image_occlusion',
        imagePath: imageDataUrl, // Stocker le Data URL au lieu du chemin fichier
        occlusionZones: occlusionZones,
      })

      session.flash('success', i18n.t('card.created_success'))
      return response.redirect().toRoute('decks.show', { id: params.deckId })
    }

    // Gestion des cartes textuelles (code existant)
    const { question, answer } = request.only(['question', 'answer']) // Récupère les champs nécessaires

    // Vérifie si la question est vide
    if (!question || question.trim().length === 0) {
      session.flash('error', i18n.t('card.question_required'))
      session.flash('old', { question, answer }) // Conserve les anciennes données saisies
      return response.redirect().back()
    }

    // On supprime cette validation
    /* if (question.trim().length < 10) {
      session.flash('error', 'La question doit contenir au moins 10 caractères.');
      session.flash('old', { question, answer });
      return response.redirect().back();
    } */

    // Vérifie si la réponse est vide
    if (!answer || answer.trim().length === 0) {
      session.flash('error', i18n.t('card.answer_required'))
      session.flash('old', { question, answer }) // Conserve les anciennes données saisies
      return response.redirect().back()
    }

    // Vérifie si une carte avec la même question existe déjà dans le deck
    const existingCard = await Card.query()
      .where('deck_id', params.deckId)
      .andWhere('question', question.trim())
      .first()

    if (existingCard) {
      session.flash('error', i18n.t('card.exists_error'))
      session.flash('old', { question, answer }) // Conserve les anciennes données saisies
      return response.redirect().back()
    }

    // Crée une nouvelle carte
    await Card.create({ question: question.trim(), answer: answer.trim(), deckId: params.deckId })

    session.flash('success', i18n.t('card.created_success')) // Message de succès
    return response.redirect().toRoute('decks.show', { id: params.deckId }) // Redirige vers la page du deck
  }

  // Affiche une carte spécifique
  async show({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate()
    const card = await Card.find(params.cardId) // Récupère la carte par ID
    return view.render('showcard', { card }) // Rendu de la vue avec la carte
  }

  // Affiche la page pour modifier une carte
  async edit({ params, view, auth }: HttpContext) {
    await auth.use('web').authenticate()
    const card = await Card.find(params.cardId) // Récupère la carte par ID
    const deck = await Deck.find(params.deckId) // Récupère le deck par ID
    const user = auth.user
    return view.render('edit_card', { card, deck, user }) // Rendu de la vue avec la carte
  }

  // Met à jour une carte
  async update({ params, request, response, session, auth, bouncer, i18n }: HttpContext) {
    await auth.use('web').authenticate()
    const deck = await Deck.find(params.deckId) // Récupère le deck par ID

    if (!deck) {
      session.flash('error', i18n.t('card.deck_not_found'))
      return response.redirect().toRoute('home')
    }
    await bouncer.with('DeckPolicy').authorize('edit', deck)

    const card = await Card.find(params.cardId) // Récupère la carte par ID
    if (card) {
      const data = request.only(['question', 'answer']) // Récupère les champs nécessaires
      card.merge(data) // Met à jour les champs de la carte
      await card.save() // Enregistre les modifications
      session.flash('success', i18n.t('card.updated_success')) // Message de succès
      return response.redirect().toRoute('decks.show', { id: deck.id }) // Redirige vers la page du deck
    }

    session.flash('error', i18n.t('card.card_not_found'))
    return response.redirect().toRoute('decks.show', { id: deck.id })
  }

  // Supprime une carte
  async destroy({ params, response, session, auth, bouncer, i18n }: HttpContext) {
    await auth.use('web').authenticate()
    const deck = await Deck.find(params.deckId) // Récupère le deck par ID

    if (!deck) {
      session.flash('error', i18n.t('card.deck_not_found'))
      return response.redirect().toRoute('home')
    }
    await bouncer.with('DeckPolicy').authorize('edit', deck) // Editing deck implies deleting cards

    const card = await Card.find(params.cardId) // Récupère la carte par ID
    if (card) {
      await card.delete() // Supprime la carte
      session.flash('success', i18n.t('card.deleted_success')) // Message de succès
      return response.redirect().toRoute('decks.show', { id: deck.id }) // Redirige vers la page du deck
    }

    session.flash('error', i18n.t('card.card_not_found')) // Message d'erreur
    return response.redirect().toRoute('decks.show', { id: deck.id })
  }
}
