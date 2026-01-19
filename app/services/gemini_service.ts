import { GoogleGenerativeAI } from "@google/generative-ai"
import env from '#start/env'

export default class GeminiService {
    private genAI: GoogleGenerativeAI

    constructor() {
        const apiKey = env.get('GEMINI_API_KEY')
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined")
        }
        this.genAI = new GoogleGenerativeAI(apiKey)
    }

    async generateCards(topic: string, count: number, language: string, options: {
        sourceText?: string,
        difficulty?: string,
        smartTitle?: boolean
    } = {}) {
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-2.0-flash",
            "gemini-pro-latest"
        ]
        let lastError = null

        const difficultyContext = options.difficulty === 'beginner'
            ? 'Simple terms, focus on core concepts.'
            : options.difficulty === 'expert'
                ? 'Advanced technical details, complex terminology, academic level.'
                : 'Standard level, balanced difficulty.'

        const inputSource = options.sourceText
            ? `based ONLY on this text: "${options.sourceText}"`
            : `about the topic: "${topic}"`

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}...`)
                const model = this.genAI.getGenerativeModel({ model: modelName })

                const prompt = `Task: Generate ${count} flashcards ${inputSource}.
Language: ${language}.
Difficulty: ${difficultyContext}.

Output format: A JSON object with two keys:
1. "title": A concise and professional title for this deck (if smartTitle is true, otherwise use "AI: ${topic}")
2. "cards": An array of objects with "question" and "answer" keys.

Rules:
- Return ONLY the JSON. No markdown, no explanations.
- If smartTitle is true, the title must be in ${language}.
- Ensure high quality flashcards.`

                const result = await model.generateContent(prompt)
                const response = await result.response
                let text = response.text().trim()

                if (text.includes('```')) {
                    text = text.replace(/```json|```/g, '').trim()
                }

                const parsed = JSON.parse(text)
                const cards = parsed.cards || (Array.isArray(parsed) ? parsed : [])
                const title = parsed.title || `AI: ${topic}`

                if (cards.length > 0) {
                    console.log(`Success with ${modelName}!`)
                    return { cards, title }
                }
            } catch (error: any) {
                console.warn(`Model ${modelName} failed:`, error.message)
                lastError = error
                continue
            }
        }

        console.error("All Gemini models failed.")
        throw lastError
    }
}
