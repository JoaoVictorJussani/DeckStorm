# Flashcards - Guide Complet

Bienvenue sur le projet Flashcards ! Ce guide regroupe toutes les informations nécessaires pour installer, configurer, dockeriser et déployer l'application, ainsi qu'un retour d'expérience sur le projet.

---

## Table des matières
1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Installation et utilisation locale](#installation-et-utilisation-locale)
4. [Dockerisation](#dockerisation)
5. [Déploiement (Railway)](#déploiement-railway)
6. [Structure du projet](#structure-du-projet)
7. [Fonctionnalités principales](#fonctionnalités-principales)
8. [Problèmes courants](#problèmes-courants)
9. [Conclusion](#conclusion)
10. [Références](#références)

---

## Introduction

Le projet Flashcards est une application web permettant de créer, organiser et réviser des cartes mémoire (decks et flashcards). Ce guide accompagne l'installation locale jusqu'à la mise en production, en passant par la dockerisation et le déploiement sur Railway.

---

## Prérequis

- Node.js (version 18 ou supérieure)
- MySQL (version 8 ou supérieure)
- Docker & Docker Compose
- Git

---

## Installation et utilisation locale

Voici les étapes détaillées pour installer et lancer le projet en local :

1. **Cloner le repository**  
   Cette commande télécharge le code source du projet depuis GitHub et vous place dans le dossier du projet.
   ```bash
   git clone https://github.com/JoaoVictor2023/Flashcards.git
   cd Flashcards
   ```

2. **Installer les dépendances**  
   Installe toutes les bibliothèques et modules nécessaires au fonctionnement du projet, listés dans le fichier `package.json`.
   ```bash
   npm install
   ```

3. **Configurer l'environnement**  
   - Copier `.env.example` en `.env` : crée un fichier de configuration local à partir d'un modèle.
   - Modifier les variables d'environnement dans `.env` : renseignez les informations de connexion à la base de données, le port, etc., pour adapter l'application à votre environnement local.
     ```properties
     PORT = 3333
     HOST = 0.0.0.0
     NODE_ENV = development
     APP_KEY = générer-une-clé-secrète-aléatoire
     DB_HOST = localhost
     DB_PORT = 3306
     DB_USER = root
     DB_PASSWORD = root
     DB_DATABASE = flashcards
     SESSION_DRIVER = cookie
     ```

4. **Créer la base de données**  
   - Avec Docker :  
     Lance les conteneurs définis dans `docker-compose.yml` (notamment MySQL).  
     ```bash
     docker-compose up -d
     ```
     Ensuite, créez la base de données `db_flashcards` dans MySQL via phpMyAdmin.

5. **Exécuter les migrations**  
   Crée les tables nécessaires dans la base de données à partir des fichiers de migration du projet.
   ```bash
   node ace migration:run
   ```

6. **Démarrer le serveur de développement**  
   Lance l'application en mode développement, ce qui permet d'accéder à l'interface web sur `http://localhost:3333`.
   ```bash
   npm run dev
   ```

---

## Dockerisation

La dockerisation permet d'exécuter l'application dans un conteneur, facilitant le déploiement et la portabilité.

### Dockerfile

Chaque commande du Dockerfile a un rôle précis :

```dockerfile
FROM node:20
# Utilise l'image officielle Node.js version 20 comme base du conteneur

WORKDIR /usr/src/app
# Définit le dossier de travail à l'intérieur du conteneur (tous les chemins suivants seront relatifs à ce dossier)

COPY package*.json ./
# Copie les fichiers package.json et package-lock.json dans le dossier de travail du conteneur

RUN npm install
# Installe toutes les dépendances listées dans package.json

COPY . .
# Copie l'ensemble des fichiers et dossiers du projet dans le conteneur

CMD ["npm", "run", "dev"]
# Définit la commande par défaut à exécuter au démarrage du conteneur (ici, lance le serveur en mode développement)
```

### Docker Compose

Le fichier `docker-compose.yml` permet de lancer plusieurs conteneurs (app, MySQL, phpMyAdmin) en une seule commande.

- **db** : MySQL 8, persistance des données, accessible sur le port 6033.
- **phpmyadmin** : Interface web pour gérer la base, accessible sur http://localhost:8080.
- **adonis** : Application Flashcards, dépend de la base, accessible sur http://localhost:3333.

#### Commandes utiles

- **Construire l'image** :
  ```bash
  docker-compose build
  ```
- **Démarrer les conteneurs** :
  ```bash
  docker-compose up -d
  ```

---

## Déploiement (Railway)

Railway permet de déployer facilement l'application et la base de données dans le cloud.

### Qu'est-ce que Railway ?

Railway est une plateforme cloud qui simplifie le déploiement d'applications web et de bases de données. Elle automatise la gestion de l'infrastructure (serveurs, bases de données, variables d'environnement, etc.) et permet de déployer une application directement depuis un dépôt GitHub, sans configuration complexe. Railway prend en charge le build, le lancement, la gestion des logs, la configuration des variables d'environnement et le provisionnement de bases de données (MySQL, PostgreSQL, etc.).

### Étapes détaillées de déploiement

1. **Créer un projet Railway et connecter le repo GitHub**  
   - Rendez-vous sur [Railway](https://railway.app/), créez un compte si besoin.
   - Cliquez sur "New Project" puis "Deploy from GitHub repo".
   - Autorisez Railway à accéder à votre compte GitHub et sélectionnez le dépôt du projet Flashcards.
   - Railway détecte automatiquement le type d'application (Node.js) et prépare le build.

2. **Ajouter une base de données MySQL via "Add Plugin"**  
   - Dans l'interface Railway, cliquez sur "Add Plugin" puis choisissez "MySQL".
   - Railway crée une instance MySQL dédiée à votre projet, accessible uniquement par votre application.
   - Les informations de connexion (host, user, password, port, database) sont générées automatiquement et visibles dans l'onglet "Variables".

3. **Configurer les variables d'environnement**  
   - Dans l'onglet "Variables" de Railway, ajoutez ou vérifiez les variables suivantes (ou copiez-les dans votre `.env` local pour les tests) :
     ```properties
     MYSQL_DATABASE = railway
     MYSQL_USER = root
     MYSQL_PASSWORD = root
     MYSQL_HOST = root
     MYSQL_PORT = 3306
     MYSQL_URL = mysql://root:root@root:3306/railway
     MYSQL_PUBLIC_URL = mysql://root:root@shuttle.proxy.rlwy.net:<port>/railway
     ```
   - Ces variables permettent à l'application de se connecter à la base de données Railway, que ce soit en production ou en local.

4. **Déploiement automatique à chaque push**  
   - À chaque fois que vous poussez du code sur la branche principale de votre dépôt GitHub, Railway déclenche automatiquement un nouveau build et redéploie l'application.
   - Vous pouvez suivre l'avancement du build et consulter les logs en temps réel depuis l'interface Railway.

5. **Accès à l'application déployée**  
   - Une fois le déploiement terminé, Railway fournit une URL publique (ex : https://deckstorm.up.railway.app) pour accéder à votre application en ligne.
   - Cette URL est accessible depuis n'importe quel navigateur, ce qui permet de partager facilement votre projet.

### Avantages de Railway

- **Simplicité** : Pas besoin de gérer des serveurs ou des configurations complexes.
- **Automatisation** : Déploiement continu à chaque modification du code.
- **Gestion centralisée** : Variables d'environnement, logs, base de données et builds accessibles depuis une seule interface.

---

## Structure du projet

- `app/` - Contrôleurs, modèles, middlewares
- `config/` - Fichiers de configuration
- `database/` - Migrations et seeders
- `public/` - Assets statiques
- `resources/` - Vues Edge
- `start/` - Fichiers de démarrage (routes, kernel, etc.)

---

## Fonctionnalités principales

- **Messages d'erreur personnalisés**  
  L'application affiche des messages d'erreur clairs et adaptés à chaque situation (ex : erreur de connexion, saisie invalide, accès non autorisé). Cela permet à l'utilisateur de comprendre rapidement la cause du problème et de savoir comment le corriger, améliorant ainsi l'expérience globale et la fiabilité de l'application.

- **Mode chronométré**  
  Lors des sessions de révision, un mode chronométré peut être activé. Ce mode impose une timer  pour répondre à chaque carte, rendant la révision plus dynamique et stimulante. Cela aide à travailler la rapidité de mémorisation et à simuler des conditions d'examen ou de test.

- **Messages Flash**  
  Les messages flash sont des notifications temporaires qui apparaissent à l'écran pour informer l'utilisateur d'une action réussie ou d'une erreur (ex : "Deck créé avec succès", "Carte supprimée", "Erreur lors de la sauvegarde"). Ils disparaissent automatiquement après quelques secondes, rendant l'interface plus interactive et réactive.

- **Gestion des decks**  
  L'utilisateur peut créer, modifier, supprimer et organiser ses propres decks de cartes. Chaque deck regroupe un ensemble de flashcards sur un thème ou une matière. Il est possible de visualiser la liste des decks, d'accéder à leur contenu, de personnaliser leur nom ou description, et de suivre sa progression pour chaque deck.

- **Ajout et gestion des flashcards**  
  Pour chaque deck, l'utilisateur peut ajouter de nouvelles cartes, éditer ou supprimer des cartes existantes. Chaque flashcard contient une question (ou un recto) et une réponse (ou un verso). L'interface permet de naviguer facilement entre les cartes, de marquer celles qui posent problème, et de revoir les cartes difficiles.

---

## Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifier les identifiants dans `.env`
   - S'assurer que MySQL est en cours d'exécution

2. **Erreur de migrations**
   - Vérifier que la base existe
   - Réinitialiser les migrations :
     ```bash
     node ace migration:refresh
     node ace migration:run
     ```

---

## Conclusion

Ce projet m'a permis de découvrir le framework Adonis, la dockerisation et le déploiement sur Railway. Ces compétences facilitent la gestion, la portabilité et la mise en production d'applications web modernes.

Au-delà de l'aspect technique, ce travail m'a appris à structurer un projet complet, à documenter chaque étape et à anticiper les problèmes courants rencontrés lors du développement et du déploiement. J'ai pu expérimenter l'intégration continue avec Railway, la gestion des environnements via Docker, et l'importance d'une bonne configuration des variables d'environnement pour garantir la sécurité et la portabilité.

Je ressors de ce projet avec une vision plus claire de la phase de développement local jusqu'à la mise en production, et une meilleure maîtrise des outils modernes de développement et de déploiement.

---

## Références

- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)
- [Railway Documentation](https://docs.railway.com/)
- [Documentation AdonisJS](https://docs.adonisjs.com/guides/preface/introduction)
- [Docker Documentation](https://docs.docker.com/)
