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
  async changePassword({ request, auth, session, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      session.flash('profile_error', "Vous devez être connecté.")
      return response.redirect().back()
    }

    const { old_password, new_password, confirm_new_password } = request.only([
      'old_password',
      'new_password',
      'confirm_new_password',
    ])

    // Vérifie l'ancien mot de passe
    if (!(await hash.verify(user.password, old_password))) {
      session.flash('profile_error', "L'ancien mot de passe est incorrect.")
      return response.redirect().back()
    }

    // Vérifie la longueur du nouveau mot de passe
    if (!new_password || new_password.length < 8) {
      session.flash('profile_error', "Le nouveau mot de passe doit avoir au moins 8 caractères.")
      return response.redirect().back()
    }

    // Vérifie la confirmation
    if (new_password !== confirm_new_password) {
      session.flash('profile_error', "Les nouveaux mots de passe ne correspondent pas.")
      return response.redirect().back()
    }

    user.password = new_password;
    await user.save();
    session.flash('profile_success', "Mot de passe changé avec succès.")
    return response.redirect().back()
  }

  async changeUsername({ request, auth, session, response }: HttpContext) {
    const user = auth.user;
    if (!user) {
      session.flash('profile_error', "Vous devez être connecté.")
      return response.redirect().back()
    }

    const { new_username } = request.only(['new_username'])

    // Check if username is already taken
    const existingUser = await User.findBy('username', new_username)
    if (existingUser) {
      session.flash('profile_error', "Ce nom d'utilisateur est déjà pris.")
      return response.redirect().back()
    }

    // Update username
    user.username = new_username
    await user.save()
    session.flash('profile_success', "Nom d'utilisateur changé avec succès.")
    return response.redirect().back()
  }
}
