/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

/*
|---------------------------------------------------------------------------
| Routes file
|---------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/


import router from '@adonisjs/core/services/router'

// Route pour la page d'accueil
router.on('/').render('pages/home')

// Route pour afficher la liste des quiz
router.get('/quiz', async ({ view }) => {
    return view.render('pages/quiz')
})

router.get('/login', async ({ view }) => {
  return view.render('pages/login')
})


router.post('/login', async ({ request, response, auth }) => {
  const email = request.input('email')
  const password = request.input('password')

  try {
    // Tente autenticar o usuário
    await auth.use('web').attempt(email, password)  // Certifique-se de usar o 'web' como autenticador

    // Redireciona para a página inicial ou outra página após login bem-sucedido
    return response.redirect('/')
  } catch (error) {
    // Caso o login falhe, redireciona para a página de login com uma mensagem de erro
    return response.redirect('/login').with('error', 'Credenciais inválidas')
  }
})


// Route pour afficher la page de création de quiz
router.get('/create-quiz', async ({ view }) => {
    return view.render('pages/create-quiz')
})

// Route pour afficher un quiz spécifique par son ID
router.get('/quiz/:id', async ({ params, view }) => {
    const quizId = params.id
    // Récupère les détails du quiz ici (à adapter en fonction de ta logique backend)
    return view.render('pages/quiz', { quizId })
})

