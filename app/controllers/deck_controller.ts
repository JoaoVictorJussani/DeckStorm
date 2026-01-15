import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'
import Like from '#models/like'

export default class DeckController {
  // Création d'un deck
  async store({ request, response, session, auth }: HttpContext) {
    const data = request.only(['title', 'description', 'visibility', 'notes']) // Récupère uniquement les champs nécessaires
    const allowedModes = request.input('allowed_modes', [])

    // Vérifie qu'au moins un mode est sélectionné
    if (allowedModes.length === 0) {
      session.flash('error', "Vous devez sélectionner au moins un mode d'exercice.")
      session.flash('old', data)
      return response.redirect().back()
    }

    // Vérifie si un deck avec le même titre existe déjà
    const existingDeck = await Deck.findBy('title', data.title)
    if (existingDeck) {
      session.flash('error', 'Un deck avec ce titre existe déjà.')
      session.flash('old', data) // Conserve les anciennes données saisies
      return response.redirect().back()
    }

    // Vérifie la longueur de la description
    if (data.description.length > 125) {
      session.flash('error', 'La description ne peut pas dépasser 125 caractères.')
      session.flash('old', data)
      return response.redirect().back()
    }

    const attemptLimit = request.input('attempt_limit')
      ? Number.parseInt(request.input('attempt_limit'))
      : null

    const deck = new Deck()
    deck.title = data.title // Définit le titre
    deck.description = data.description // Définit la description
    deck.visibility = data.visibility // Définit la visibilité
    deck.allowed_modes = allowedModes // Définit les modes autorisés
    deck.attempt_limit = attemptLimit
    deck.notes = data.notes
    if (auth.user) {
      deck.user_id = auth.user.id // Associe le deck à l'utilisateur connecté
    } else {
      session.flash('error', 'Utilisateur non authentifié.')
      return response.unauthorized('User not authenticated')
    }

    await deck.save() // Enregistre le deck dans la base de données

    session.flash('success', 'Deck créé avec succès !') // Message de succès
    return response.redirect().toRoute('home') // Redirige vers la page d'accueil
  }

  // Mise à jour d'un deck
  async update({ params, request, response, session, bouncer }: HttpContext) {
    const deck = await Deck.find(params.id)
    const data = request.only(['title', 'description', 'visibility', 'notes'])
    const allowedModes = request.input('allowed_modes', [])
    const attemptLimit = request.input('attempt_limit')
      ? Number.parseInt(request.input('attempt_limit'))
      : null

    if (!deck) {
      return response.notFound('Deck not found')
    }
    await bouncer.with('DeckPolicy').authorize('update', deck)

    if (allowedModes.length === 0) {
      session.flash('error', "Vous devez sélectionner au moins un mode d'exercice.")
      return response.redirect().back()
    }

    // Vérifie la longueur de la description
    if (data.description.length > 125) {
      session.flash('error', 'La description ne peut pas dépasser 125 caractères.')
      return response.redirect().back()
    }

    deck.merge(data)
    deck.allowed_modes = allowedModes
    deck.attempt_limit = attemptLimit
    await deck.save()
    session.flash('success', 'Deck mis à jour avec succès !')
    return response.redirect().toRoute('decks.show', { id: deck.id })
  }

  // Suppression d'un deck
  async destroy({ params, response, session, bouncer }: HttpContext) {
    const deck = await Deck.find(params.id) // Récupère le deck par ID
    if (!deck) {
      session.flash('error', 'Deck introuvable.')
      return response.redirect().toRoute('home')
    }
    await bouncer.with('DeckPolicy').authorize('delete', deck)

    await deck.delete() // Supprime le deck
    session.flash('success', 'Deck supprimé avec succès !') // Message de succès

    return response.redirect().toRoute('home') // Redirige vers la page d'accueil
  }

  // Like a deck
  async like({ params, auth, response, request }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }
    const userId = auth.user.id
    const deckId = Number(params.id)
    const returnView = request.input('returnView')

    const exists = await Like.query().where('user_id', userId).andWhere('deck_id', deckId).first()
    if (!exists) {
      await Like.create({ user_id: userId, deck_id: deckId })
    }

    // Return to the same view
    if (returnView === 'list') {
      // Récupère l'URL précédente
      const referer = request.headers().referer || '/'
      // Ajoute le paramètre view=list à l'URL précédente
      const url = new URL(referer, `${request.protocol()}://${request.hostname()}`)
      url.searchParams.set('view', 'list')
      return response.redirect(url.pathname + url.search)
    }
    return response.redirect().back()
  }

  // Unlike a deck
  async unlike({ params, auth, response, request }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }
    const userId = auth.user.id
    const deckId = Number(params.id)
    const returnView = request.input('returnView')

    await Like.query().where('user_id', userId).andWhere('deck_id', deckId).delete()

    // Return to the same view
    if (returnView === 'list') {
      // Récupère l'URL précédente
      const referer = request.headers().referer || '/'
      // Ajoute le paramètre view=list à l'URL précédente
      const url = new URL(referer, `${request.protocol()}://${request.hostname()}`)
      url.searchParams.set('view', 'list')
      return response.redirect(url.pathname + url.search)
    }
    return response.redirect().back()
  }

  // API endpoints for likes
  async apiLike({ params, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }
    const userId = auth.user.id
    const deckId = Number(params.id)

    const exists = await Like.query().where('user_id', userId).andWhere('deck_id', deckId).first()

    if (!exists) {
      await Like.create({ user_id: userId, deck_id: deckId })
    }

    const likesCount = await Like.query().where('deck_id', deckId).count('* as total')

    return response.json({
      success: true,
      likesCount: likesCount[0].$extras.total,
    })
  }

  async apiUnlike({ params, auth, response }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized('User not authenticated')
    }
    const userId = auth.user.id
    const deckId = Number(params.id)

    await Like.query().where('user_id', userId).andWhere('deck_id', deckId).delete()

    const likesCount = await Like.query().where('deck_id', deckId).count('* as total')

    return response.json({
      success: true,
      likesCount: likesCount[0].$extras.total,
    })
  }

  async report({ params, view, bouncer }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (!deck) {
      return view.render('./pages/errors/not_found')
    }

    await bouncer.with('DeckPolicy').authorize('edit', deck)

    const exerciseAttemptModule = await import('#models/exercise_attempt')
    const ExerciseAttempt = exerciseAttemptModule.default

    // Fetch all attempts for this deck
    const attempts = await ExerciseAttempt.query()
      .where('deck_id', deck.id)
      .preload('user')
      .preload('card')
      .orderBy('user_id')
      .orderBy('created_at', 'desc')

    // Group by (user, session)
    // We assume a session is defined by attempts happening within a short window (e.g. 5 minutes)
    const reports: any[] = []
    let currentReport: any = null

    for (const attempt of attempts) {
      if (!attempt.user) continue

      let addToCurrent = false
      if (currentReport) {
        const sameUser = currentReport.user.id === attempt.user.id
        // Time difference in minutes
        const lastAttempt = currentReport.attempts[currentReport.attempts.length - 1]
        const diffMinutes = Math.abs(
          attempt.createdAt.diff(lastAttempt.createdAt, 'minutes').minutes
        )

        // Threshold: 30 minutes between attempts to group them in the same session,
        // allowing for "jusqu'au-bout" retries which might happen after a review period.
        if (sameUser && diffMinutes < 30) {
          addToCurrent = true
        }
      }

      if (addToCurrent) {
        currentReport.attempts.push(attempt)
        if (attempt.isCorrect) {
          currentReport.correctCount++
        } else {
          currentReport.wrongCount++
        }
      } else {
        // Create new report session
        currentReport = {
          user: attempt.user,
          date: attempt.createdAt,
          attempts: [attempt],
          correctCount: attempt.isCorrect ? 1 : 0,
          wrongCount: attempt.isCorrect ? 0 : 1,
        }
        reports.push(currentReport)
      }
    }

    return view.render('deck_report', {
      deck,
      reportByUser: reports,
    })
  }

  // Convidar usuário para deck restrito
  async inviteUser({ params, request, response, session, auth, bouncer }: HttpContext) {
    const user = auth.user!
    const deck = await Deck.find(params.id)
    if (!deck) {
      session.flash('error', 'Deck non trouvé')
      return response.redirect().back()
    }

    await bouncer.with('DeckPolicy').authorize('edit', deck)

    if (deck.visibility !== 'restricted') {
      session.flash('error', "Ce deck n'est pas restreint.")
      return response.redirect().back()
    }
    const username = request.input('invite_username', '').trim()
    if (!username) {
      session.flash('error', "Nom d'utilisateur requis.")
      return response.redirect().back()
    }
    // Busca usuário pelo nome
    const UserModule = await import('#models/user')
    const User = UserModule.default
    const invitedUser = await User.findBy('username', username)
    if (!invitedUser || invitedUser.id === user.id) {
      session.flash('error', 'Utilisateur invalide ou vous-même.')
      return response.redirect().back()
    }
    // Atualiza allowed_users_ids
    let allowed = deck.allowed_users_ids ?? []
    if (!allowed.includes(invitedUser.id)) {
      allowed.push(invitedUser.id)
      deck.allowed_users_ids = allowed // Force reassign to trigger dirty state if needed, though pushing to array might not be enough for Lucid to detect change on JSON column sometimes, so reassignment is safer.
      await deck.save()
      // Notificação
      const NotificationModule = await import('#models/notification')
      const Notification = NotificationModule.default
      await Notification.create({
        user_id: invitedUser.id,
        message: `Vous avez été invité à accéder au deck restreint «${deck.title}» (ID:${deck.id}) par «${user.username}»`,
        type: 'invite',
        deck_id: deck.id,
      })
      session.flash('success', 'Utilisateur invité avec succès.')
    } else {
      session.flash('error', 'Utilisateur déjà autorisé.')
    }
    return response.redirect().back()
  }
  async exportReport({ params, response, bouncer }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (!deck) {
      return response.notFound('Deck not found')
    }

    await bouncer.with('DeckPolicy').authorize('edit', deck)

    const exerciseAttemptModule2 = await import('#models/exercise_attempt')
    const ExerciseAttempt = exerciseAttemptModule2.default

    // Fetch all attempts for this deck same as report
    const attempts = await ExerciseAttempt.query()
      .where('deck_id', deck.id)
      .preload('user')
      .preload('card')
      .orderBy('user_id')
      .orderBy('created_at', 'desc')

    const ExcelJSModule = await import('exceljs')
    const ExcelJS = ExcelJSModule.default
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rapport')

    worksheet.columns = [
      { header: 'Utilisateur', key: 'user', width: 20 },
      { header: 'Question', key: 'question', width: 40 },
      { header: 'Réponse', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ]

    attempts.forEach((attempt) => {
      if (!attempt.user) return
      const row = worksheet.addRow({
        user: attempt.user.username,
        question: attempt.card ? attempt.card.question : 'Carte supprimée',
        status: attempt.isCorrect ? 'Correct' : 'Incorrect',
        date: attempt.createdAt.toFormat('dd/MM/yyyy HH:mm'),
      })

      // Optional conditional formatting
      if (attempt.isCorrect) {
        row.getCell('status').font = { color: { argb: 'FF008000' } } // Green
      } else {
        row.getCell('status').font = { color: { argb: 'FFFF0000' } } // Red
      }
    })

    // Header styling
    worksheet.getRow(1).font = { bold: true, size: 12 }

    response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.header(
      'Content-Disposition',
      `attachment; filename="Rapport-${deck.title.replace(/[^a-z0-9]/gi, '_')}.xlsx"`
    )

    const buffer = await workbook.xlsx.writeBuffer()
    return response.send(buffer)
  }

  async updateNotes({ params, request, response, session, bouncer }: HttpContext) {
    const deck = await Deck.find(params.id)
    if (!deck) {
      return response.notFound('Deck not found')
    }
    await bouncer.with('DeckPolicy').authorize('update', deck)

    deck.notes = request.input('notes')
    await deck.save()

    session.flash('success', 'Notes enregistrées !')
    return response.redirect().back()
  }
}
