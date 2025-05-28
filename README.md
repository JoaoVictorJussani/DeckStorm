# Flashcards - Guide d'installation

Ce guide vous explique comment installer et configurer le projet Flashcards depuis zéro.

## Prérequis

- Node.js (version 18 ou supérieure)
- MySQL (version 8 ou supérieure)
- Git

## Étapes d'installation

1. **Cloner le repository**

   ```bash
   git clone https://github.com/votre-compte/Flashcards.git
   cd Flashcards
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer l'environnement**

   - Copier le fichier `.env.example` en `.env`
   - Modifier les variables d'environnement suivantes dans le fichier `.env`:
     ```properties
     PORT = 3333
     HOST = 0.0.0.0
     NODE_ENV = development
     APP_KEY = générer-une-clé-secrète-aléatoire
     DB_HOST = localhost
     DB_PORT = 3306
     DB_USER = votre_utilisateur_mysql
     DB_PASSWORD = votre_mot_de_passe_mysql
     DB_DATABASE = flashcards
     SESSION_DRIVER = cookie
     ```

4. **Créer la base de données**

   ```bash
   docker-compose up -d;
   ```
   et créer la base de données db_Flashcards

5. **Exécuter les migrations**

   ```bash
   node ace migration:run
   ```

6. **Démarrer le serveur de développement**

   ```bash
   node ace serve --watch
   ```

## Structure du projet

- `app/` - Contient les contrôleurs, modèles et middlewares
- `config/` - Fichiers de configuration
- `database/` - Migrations et seeders
- `public/` - Assets statiques
- `resources/` - Vues Edge
- `start/` - Fichiers de démarrage (routes, kernel, etc.)

## Fonctionnalités principales (pour atteindre le niveau 8)

- Avoir de bons messages d'erreur  
   Des messages personnalisés et clairs qui aident l'utilisateur à comprendre les problèmes rencontrés, facilitant ainsi leur résolution.

- Mode chronométré  
   Un mode qui limite le temps de réponse pour rendre les sessions de révision plus dynamiques et stimulantes.

- Messages Flash  
   Des notifications instantanées qui informent l'utilisateur des actions effectuées, améliorant ainsi l'interactivité et l'expérience utilisateur.

- Gérer sa collection de decks  
   Outil pour organiser, visualiser et personnaliser ses decks de flashcards, permettant un suivi de progression et une gestion efficace des contenus.

## Utilisation de base

1. Créez un compte utilisateur
2. Connectez-vous
3. Créez un nouveau deck
4. Ajoutez des cartes à votre deck
5. Commencez à réviser !

## Docker

Docker est utilisé pour créer des environnements isolés (appelés conteneurs) qui contiennent tout ce qu’il faut pour faire tourner votre app : Node.js, MySQL, etc.


utilisation de Docker :

1. ****Construire l’image du projet**

   ```bash
   docker-compose build
   ```
   Cette commande lit le fichier docker-compose.yml pour créer les images nécessaires à partir de vos fichiers Dockerfile.

2. **Démarrer les conteneurs**

   ```bash
   docker-compose up -d
   ```

Cela lance tous les services définis dans docker-compose.yml en arrière-plan (-d = détaché). Typiquement :

un conteneur app Adonis 

un conteneur pour MySQL

un conteneur pour phpMyAdmin

## Problèmes courants

1. **Erreur de connexion à la base de données**

   - Vérifiez les identifiants dans le fichier `.env`
   - Assurez-vous que MySQL est en cours d'exécution

2. **Erreur de migrations**

   - Vérifiez que la base de données existe
   - Essayez de réinitialiser les migrations : 
     ```bash
     node ace migration:refresh
     node ace migration:run
     ```

## Dockerfile


FROM node:20 --> On part de l'image officielle de Node.js version 20

WORKDIR /usr/src/app --> On définit le répertoire de travail dans le conteneur

COPY package*.json ./ --> copie les fichiers .json et gère les dépendances via npm

RUN npm install --> On installe les dépendances définies dans package.json

COPY . . --> On copie le reste des fichiers du projet dans le répertoire de travail du conteneur

CMD ["npm", "run", "dev"] --> On spécifie la commande à exécuter lorsqu'un conteneur est lancé à partir de cette image


## Production Railway

1. **Nouveau Projet**

Railway est une plateforme cloud qui vous permet de déployer facilement vos applications web et vos bases de données directement à partir de votre code GitHub, sans avoir à gérer l'infrastructure.

Vous allez sur Railway et cliquez sur "New Project".
Ensuite, vous choisissez "Deploy from GitHub repo" pour connecter votre dépôt GitHub.
Railway vous demandera d'autoriser l'accès à vos repos : acceptez et choisissez le bon projet à déployer.

Une fois le projet sélectionné, Railway détectera automatiquement le type d'application (par exemple Node.js, Python, etc.).

Puis, vous ajoutez une base de données en cliquant sur "Add Plugin", et vous choisissez MySQL (ou une autre selon votre besoin).
Railway créera la base et vous affichera toutes les infos nécessaires (URL, mot de passe, host, port...).

2. **Mettre les valeurs en commum entre railway et notre ".env":**

Vous devez maintenant faire le lien entre Railway et votre application.

Pour cela, vous ajoutez les variables suivantes dans la section Environment de votre projet Railway, ou dans votre fichier .env local :

 ```properties
  - MYSQL_DATABASE = railway  
  - MYSQL_USER = root  
  - MYSQL_PASSWORD = ZFjaBOuZqzCkaRkkPZzetRDUBGcwYWmZ  
  - MYSQL_HOST = mysql-htxz.railway.internal  
  - MYSQL_PORT = 3306  
  - MYSQL_URL = mysql://root:ZFjaBOuZqzCkaRkkPZzetRDUBGcwYWmZ@mysql-htxz.railway.internal:3306/railway  
  - MYSQL_PUBLIC_URL = mysql://root:ZFjaBOuZqzCkaRkkPZzetRDUBGcwYWmZ@shuttle.proxy.rlwy.net:42483/railway
 ```

Assurez-vous que votre code utilise ces variables avec une librairie comme dotenv, si vous êtes en Node.js :

  - require('dotenv').config();

3. **Déployez automatiquement**
En pushant du nouveau code sur GitHub, Railway redéploie votre app automatiquement.
Vous pouvez suivre les logs en direct et voir si tout se passe bien.
Une fois le déploiement terminé, Railway vous fournit une URL publique comme :
https://deckstorm.up.railway.app

