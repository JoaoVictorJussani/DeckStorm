// Authentification
import type { HttpContext } from '@adonisjs/core/http'
import { loginUserValidator, registerUserValidator } from '#validators/auth'
import User from '#models/user'

export default class AuthController {
  // Connexion
  async handleLogin({ request, auth, session, response }: HttpContext) {
    const { username, password } = await request.validateUsing(loginUserValidator)

    const user = await User.verifyCredentials(username, password)

    await auth.use('web').login(user)

    session.flash('success', "L'utilisateur s'est connecté avec succès")

    return response.redirect().toRoute('home')
  }

  // Déconnexion
  async handleLogout({ auth, session, response }: HttpContext) {
    await auth.use('web').logout()

    session.flash('success', "L'utilisateur s'est déconnecté avec succès")

    return response.redirect().toRoute('home')
  }

  // Inscription
  async handleRegister({ request, auth, session, response }: HttpContext) {
    const { username, password } = await request.validateUsing(registerUserValidator)

    const existingUser = await User.findBy('username', username)
    if (existingUser) {
      session.flash('error', "Insciption fail, Ce nom d'utilisateur est déjà pris")
      return response.redirect().back()
    }

    const user = await User.create({
      username,
      password,
      isAdmin: false,
    })

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }  
}
