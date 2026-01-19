import type { HttpContext } from '@adonisjs/core/http'
import Deck from '#models/deck'
import Card from '#models/card'
import GeminiService from '#services/gemini_service'
import env from '#start/env'

export default class AiDecksController {

    /**
     * Show the AI Generation Form
     */
    async index({ response }: HttpContext) {
        return response.redirect().toRoute('decks.create')
    }

    /**
     * Handle the AI generation form submission
     */
    async generate({ request, response, auth, session }: HttpContext) {
        const mode = request.input('mode', 'topic')
        const topic = request.input('topic')
        const sourceText = request.input('source_text')
        const difficulty = request.input('difficulty', 'intermediate')
        const smartTitle = request.input('smart_title') === 'true'

        const count = request.input('count', 10)
        const language = request.input('language', 'fr')
        const visibility = request.input('visibility', 'private')
        const allowedModes = request.input('allowed_modes', ['chronometre', 'basique', 'jusquaubout', 'quiz', 'typed'])
        const attemptLimit = request.input('attempt_limit') ? Number(request.input('attempt_limit')) : null

        const user = auth.user!

        if (!env.get('GEMINI_API_KEY')) {
            session.flash('error', "Configuration manquante : La clé API Gemini n'est pas configurée.")
            return response.redirect().back()
        }

        try {
            // 1. Call AI Service with full options
            const aiService = new GeminiService()
            const { cards, title: aiTitle } = await aiService.generateCards(topic || "Course Extraction", count, language, {
                sourceText: mode === 'text' ? sourceText : undefined,
                difficulty: difficulty,
                smartTitle: smartTitle
            })

            // 2. Create Deck
            const deck = await Deck.create({
                title: aiTitle,
                description: mode === 'text' ? `Généré à partir d'un texte (Mode: ${difficulty})` : `Généré sur le sujet : ${topic} (Mode: ${difficulty})`,
                visibility: visibility,
                allowed_modes: allowedModes,
                attempt_limit: attemptLimit,
                user_id: user.id
            })

            // 3. Create Cards
            for (const cardData of cards) {
                await Card.create({
                    deckId: deck.id,
                    question: cardData.question,
                    answer: cardData.answer,
                    cardType: 'flashcard'
                })
            }

            // 4. Success !
            session.flash('success', `✨ Deck "${aiTitle}" créé avec ${cards.length} cartes !`)
            return response.redirect().toRoute('decks.show', { id: deck.id })

        } catch (error: any) {
            console.error("AI Generation Error FULL:", error)

            let errorMessage = "Oups, la magie n'a pas opéré. Réessayez plus tard."

            // Log details if available
            if (error.response) {
                console.error("AI Error Response:", error.response.data)
            }

            if (error.message?.includes('API_KEY_INVALID')) {
                errorMessage = "La clé API Gemini est invalide ou expirée."
            } else if (error.message?.includes('SAFETY')) {
                errorMessage = "Le sujet demandé a été bloqué par les filtres de sécurité."
            } else if (error.status === 429) {
                errorMessage = "Quota dépassé (Trop de requêtes). Attendez 1 minute."
            } else if (error.message?.includes('fetch failed')) {
                errorMessage = "Erreur de connexion : Impossible de joindre les serveurs Gemini."
            }

            session.flash('error', `${errorMessage} (${error.message || 'Error unknown'})`)
            return response.redirect().back()
        }
    }
}