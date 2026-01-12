import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID') || 'placeholder',
    clientSecret: env.get('GOOGLE_CLIENT_SECRET') || 'placeholder',
    callbackUrl: env.get('GOOGLE_CALLBACK_URL', 'http://localhost:3333/auth/google/callback'),
  }),
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID') || 'placeholder',
    clientSecret: env.get('GITHUB_CLIENT_SECRET') || 'placeholder',
    callbackUrl: env.get('GITHUB_CALLBACK_URL', 'http://localhost:3333/auth/github/callback'),
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
