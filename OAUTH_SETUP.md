# Configuration OAuth pour DeckStorm

Ce guide explique comment configurer l'authentification OAuth avec Google, GitHub et Discord.

## 📋 Prérequis

Vous devez créer des applications OAuth sur chaque plateforme que vous souhaitez utiliser.

## 🔧 Configuration

### 1. Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0 :
   - Type d'application : Application Web
   - URI de redirection autorisés : `http://localhost:3333/auth/google/callback`
5. Copiez le **Client ID** et le **Client Secret**
6. Ajoutez-les dans votre fichier `.env` :
   ```
   GOOGLE_CLIENT_ID=votre_client_id
   GOOGLE_CLIENT_SECRET=votre_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3333/auth/google/callback
   ```

### 2. GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez les informations :
   - Application name : DeckStorm
   - Homepage URL : `http://localhost:3333`
   - Authorization callback URL : `http://localhost:3333/auth/github/callback`
4. Créez l'application et copiez le **Client ID**
5. Générez un **Client Secret**
6. Ajoutez-les dans votre fichier `.env` :
   ```
   GITHUB_CLIENT_ID=votre_client_id
   GITHUB_CLIENT_SECRET=votre_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3333/auth/github/callback
   ```

## 🚀 Utilisation

Une fois configuré, les utilisateurs peuvent se connecter via :

- **Google** : `/auth/google`
- **GitHub** : `/auth/github`
- **Discord** : `/auth/discord`

Les boutons sont automatiquement affichés sur la page de connexion.

## 🔐 Sécurité

- Les mots de passe des utilisateurs OAuth sont `null` (ils n'en ont pas besoin)
- Chaque compte OAuth est lié par `oauth_provider` + `oauth_id`
- Si un utilisateur s'inscrit avec un email, puis se connecte via OAuth avec le même email, les comptes sont automatiquement liés

## 📝 Notes

- En production, n'oubliez pas de mettre à jour les URLs de callback avec votre domaine réel
- Les variables d'environnement OAuth sont optionnelles - vous pouvez activer seulement les providers que vous souhaitez
- Les utilisateurs peuvent avoir à la fois un mot de passe ET un compte OAuth lié
