// Authentification
import type { HttpContext } from '@adonisjs/core/http'
import { loginUserValidator, registerUserValidator } from '#validators/auth'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

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
    })

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }  

  // Changement de mot de passe
  async changePassword({ request, auth, session, response, params }: HttpContext) {
    const user = auth.user
    if (!user || user.id !== Number(params.id)) {
      session.flash('profile_error', "Accès refusé.")
      return response.redirect().toRoute('account', { id: params.id })
    }

    const { old_password, new_password, confirm_new_password } = request.only([
      'old_password',
      'new_password',
      'confirm_new_password',
    ])

    // Vérifie l'ancien mot de passe
    if (!(await hash.verify(user.password, old_password))) {
      session.flash('profile_error', "L'ancien mot de passe est incorrect.")
      return response.redirect().toRoute('account', { id: user.id })
    }

    // Vérifie la longueur du nouveau mot de passe
    if (!new_password || new_password.length < 8) {
      session.flash('profile_error', "Le mot de passe doit avoir 8 caractères")
      return response.redirect().toRoute('account', { id: user.id })
    }

    // Vérifie la confirmation
    if (new_password !== confirm_new_password) {
      session.flash('profile_error', "La vérification de mot de passe est correcte")
      return response.redirect().toRoute('account', { id: user.id })
    }

    user.password = new_password
    await user.save()
    session.flash('profile_success', "Mot de passe changé avec succès.")
    return response.redirect().toRoute('account', { id: user.id })
  }
}
