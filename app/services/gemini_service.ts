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
        smartTitle?: boolean,
        imageData?: { mimeType: string, data: string },
        cardType?: 'flashcard' | 'mcq' | 'truefalse' | 'mixed'
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

        let inputSource = ""
        if (options.imageData) {
            inputSource = `extracted from the provided image`
        } else if (options.sourceText) {
            inputSource = `based ONLY on this text: "${options.sourceText}"`
        } else {
            inputSource = `about the topic: "${topic}"`
        }

        const typeContext = options.cardType === 'mcq'
            ? 'Format: Multiple Choice Questions. Provide the question and the correct answer.'
            : options.cardType === 'truefalse'
                ? 'Format: True or False questions. Provide an assertion and "True" or "False" as the answer.'
                : options.cardType === 'mixed'
                    ? 'Format: A mix of flashcards, MCQs, and True/False questions.'
                    : 'Format: Standard Flashcards (Question/Answer).'

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}...`)
                const model = this.genAI.getGenerativeModel({ model: modelName })

                const prompt = `Task: Generate ${count} cards ${inputSource}.
Language: ${language}.
Difficulty: ${difficultyContext}.
${typeContext}

Output format: A JSON object with three keys:
1. "title": A concise and professional title for this deck (if smartTitle is true, otherwise use "AI: ${topic}")
2. "description": A 2-3 line professional pedagogical description of the content in ${language}.
3. "cards": An array of objects with "question" and "answer" keys.

Rules:
- Return ONLY the JSON. No markdown, no explanations.
- If smartTitle is true, the title must be in ${language}.
- Ensure high quality flashcards.
- If an image is provided, focus on the handwritten or printed text clearly visible.
- Even for MCQs, keep "answer" as a single string (the correct choice).`

                const parts: any[] = [{ text: prompt }]
                if (options.imageData) {
                    parts.push({
                        inlineData: {
                            mimeType: options.imageData.mimeType,
                            data: options.imageData.data
                        }
                    })
                }

                const result = await model.generateContent(parts)
                const response = await result.response
                let text = response.text().trim()

                if (text.includes('```')) {
                    text = text.replace(/```json|```/g, '').trim()
                }

                const parsed = JSON.parse(text)
                const cards = parsed.cards || (Array.isArray(parsed) ? parsed : [])
                const title = parsed.title || `AI: ${topic}`
                const description = parsed.description || ""

                if (cards.length > 0) {
                    console.log(`Success with ${modelName}!`)
                    return { cards, title, description }
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
