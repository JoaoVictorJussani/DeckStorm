import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { AllyUserContract } from '@adonisjs/ally/types'

export default class SocialAuthController {
    /**
     * Redirect user to the OAuth provider
     */
    async redirect({ ally, params, response, session }: HttpContext) {
        const provider = params.provider as 'google' | 'github'

        // Validate provider
        const supportedProviders = ['google', 'github']
        if (!supportedProviders.includes(provider)) {
            session.flash('error', 'Provider OAuth non supporté')
            return response.redirect('/login')
        }

        // Redirect to the OAuth provider
        return ally.use(provider).redirect()
    }

    /**
     * Handle OAuth callback
     */
    async callback({ ally, auth, response, session, params }: HttpContext) {
        const provider = params.provider as 'google' | 'github'

        try {
            const allyUser: AllyUserContract<any> = await ally.use(provider).user()

            // Find or create user based on OAuth data
            const user = await this.findOrCreateUser(allyUser, provider)

            // Log the user in
            await auth.use('web').login(user)

            session.flash('success', `Bienvenue ${user.username} !`)
            return response.redirect().toRoute('home')
        } catch (error) {
            console.error('OAuth callback error:', error)
            session.flash('error', 'Erreur lors de la connexion avec ' + provider)
            return response.redirect('/login')
        }
    }

    /**
     * Find or create a user from OAuth data
     */
    private async findOrCreateUser(allyUser: AllyUserContract<any>, provider: string): Promise<User> {
        // Try to find existing user by OAuth provider and ID
        let user = await User.query()
            .where('oauth_provider', provider)
            .where('oauth_id', allyUser.id)
            .first()

        if (user) {
            // Update user info if needed
            user.email = allyUser.email || user.email
            user.avatarUrl = allyUser.avatarUrl || user.avatarUrl
            await user.save()
            return user
        }

        // Try to find user by email if they registered traditionally
        if (allyUser.email) {
            user = await User.query().where('email', allyUser.email).first()

            if (user) {
                // Link OAuth account to existing user
                user.oauthProvider = provider
                user.oauthId = allyUser.id
                user.avatarUrl = allyUser.avatarUrl || user.avatarUrl
                await user.save()
                return user
            }
        }

        // Create new user
        const username = this.generateUsername(allyUser, provider)

        user = await User.create({
            username,
            email: allyUser.email,
            oauthProvider: provider,
            oauthId: allyUser.id,
            avatarUrl: allyUser.avatarUrl,
            password: null, // OAuth users don't have a password
        })

        return user
    }

    /**
     * Generate a unique username from OAuth data
     */
    private generateUsername(allyUser: AllyUserContract<any>, provider: string): string {
        // Try to use the nickname or name from OAuth
        let baseUsername = allyUser.nickName || allyUser.name || `${provider}_user`

        // Remove spaces and special characters
        baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '_')

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        return `${baseUsername}_${randomSuffix}`
    }
}
