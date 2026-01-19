import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'
import Card from '#models/card'
import GeminiService from '#services/gemini_service'
import env from '#start/env'

export default class AiDecksController {
    async index({ response }: HttpContext) {
        // Redirige vers la nouvelle page intégrée
        return response.redirect().toRoute('decks.create')
    }

    async generate({ request, response, session }: HttpContext) {
        const mode = request.input('mode', 'topic')
        const topic = request.input('topic')
        const sourceText = request.input('source_text')
        const difficulty = request.input('difficulty', 'intermediate')
        const smartTitle = request.input('smart_title') === 'true'
        const cardType = request.input('card_type', 'flashcard')

        const count = request.input('count', 10)
        const language = request.input('language', 'fr')

        // Deck configuration (saved to session for final step)
        const deckConfig = {
            visibility: request.input('visibility', 'private'),
            allowed_modes: request.input('allowed_modes', ['chronometre', 'basique', 'jusquaubout', 'quiz', 'typed']),
            attempt_limit: request.input('attempt_limit') ? Number(request.input('attempt_limit')) : null
        }

        if (!env.get('GEMINI_API_KEY')) {
            session.flash('error', "Configuration manquante : La clé API Gemini n'est pas configurée.")
            return response.redirect().back()
        }

        let imageData: { mimeType: string, data: string } | undefined
        if (mode === 'image') {
            const imageFile = request.file('image', {
                size: '5mb',
                extnames: ['jpg', 'png', 'jpeg', 'webp']
            })

            if (!imageFile) {
                session.flash('error', "Veuillez sélectionner une image.")
                return response.redirect().back()
            }

            if (!imageFile.isValid) {
                session.flash('error', "Image invalide ou trop lourde.")
                return response.redirect().back()
            }

            const fs = await import('node:fs')
            const path = imageFile.tmpPath!
            const buffer = fs.readFileSync(path)
            imageData = {
                mimeType: imageFile.headers['content-type'] || 'image/jpeg',
                data: buffer.toString('base64')
            }
        }

        try {
            const aiService = new GeminiService()
            const { cards, title: aiTitle, description: aiDescription } = await aiService.generateCards(topic || "Course Extraction", count, language, {
                sourceText: mode === 'text' ? sourceText : undefined,
                difficulty: difficulty,
                smartTitle: smartTitle,
                imageData: imageData,
                cardType: cardType as any
            })

            // Store in session for review
            session.put('ai_draft', {
                title: aiTitle,
                description: aiDescription || (mode === 'text' ? `Généré à partir d'un texte (Mode: ${difficulty})` : (mode === 'image' ? `Généré à partir d'une image (Mode: ${difficulty})` : `Généré sur le sujet : ${topic} (Mode: ${difficulty})`)),
                cards: cards,
                config: deckConfig
            })

            return response.redirect().toRoute('ai.review')
        } catch (error: any) {
            console.error("AI Generation Error FULL:", error)
            session.flash('error', `Erreur de génération : ${error.message || 'L\'IA n\'a pas pu répondre.'}`)
            return response.redirect().back()
        }
    }

    async review({ view, session, response }: HttpContext) {
        const draft = session.get('ai_draft')
        if (!draft) {
            session.flash('error', "Session de génération expirée.")
            return response.redirect().toRoute('decks.create')
        }

        return view.render('ai/review', { draft })
    }

    async confirm({ request, response, auth, session }: HttpContext) {
        const draft = session.get('ai_draft')
        if (!draft) {
            session.flash('error', "Session expirée.")
            return response.redirect().toRoute('decks.create')
        }

        const title = request.input('title', draft.title)
        const description = request.input('description', draft.description)
        const questions = request.input('questions', [])
        const answers = request.input('answers', [])

        const user = auth.user!

        try {
            // 1. Create Deck
            const deck = await Deck.create({
                title: title,
                description: description,
                visibility: draft.config.visibility,
                allowed_modes: draft.config.allowed_modes,
                attempt_limit: draft.config.attempt_limit,
                user_id: user.id
            })

            // 2. Create Cards from edited inputs
            for (let i = 0; i < questions.length; i++) {
                if (questions[i] && answers[i]) {
                    await Card.create({
                        deckId: deck.id,
                        question: questions[i],
                        answer: answers[i],
                        cardType: 'flashcard'
                    })
                }
            }

            // Clean up session
            session.forget('ai_draft')

            session.flash('success', `✨ Baralho criado com sucesso!`)
            return response.redirect().toRoute('decks.show', { id: deck.id })
        } catch (error) {
            console.error("Confirm error:", error)
            session.flash('error', "Une erreur est survenue lors de la sauvegarde.")
            return response.redirect().back()
        }
    }
}