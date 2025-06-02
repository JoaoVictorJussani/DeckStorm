import vine from '@vinejs/vine'
const loginUserValidator = vine.compile(
  vine.object({
    username: vine.string(),
    password: vine.string().minLength(4),
  })
)

const registerUserValidator = vine.compile(
  vine.object({
    username: vine.string().trim().minLength(3).maxLength(30), // Le username ne peut pas être vide et a une longueur entre 3 et 30 caractères
    password: vine.string().minLength(8), // Mot de passe d'au moins 8 caractères
    confirm_password: vine.string().sameAs('password'), // Vérifie que confirm_password correspond bien à password
  })
)

const changeUsernameValidator = vine.compile(
  vine.object({
    new_username: vine.string().trim().minLength(3).maxLength(30),
  })
)

export { loginUserValidator, registerUserValidator, changeUsernameValidator }
