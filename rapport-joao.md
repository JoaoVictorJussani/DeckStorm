# Rapport de Joao

## Ce que l’application permet de faire

### Connexion et utilisateurs  
- On peut se connecter, s’inscrire et se déconnecter facilement.  
- Les informations que l'on rentre sont vérifiées (par exemple, la taille des champs est contrôlée, il ne faut pas entrer n’importe quoi).  
- Le pseudo doit être unique, donc si quelqu’un l’a déjà pris, on doit en choisir un autre.

### Gestion des decks (les ensembles de cartes)  
- On peut créer un deck avec un titre, une courte description et choisir s’il est privé ou public.  
- On peut modifier ou supprimer son propre deck.  
- On voit ses decks et ceux des autres (si publics), avec un système de recherche par titre.  
- Tout passe par des contrôleurs et le modèle Deck pour effectuer les opérations (ajouter, lire, modifier, supprimer).

### Cartes  
- On peut ajouter, modifier, supprimer et visualiser les cartes d’un deck.  
- Il y a un minimum de contenu à respecter (par exemple, la question doit comporter au moins 10 caractères).  
- On vérifie également qu’il n’y ait pas deux fois la même question dans un même deck.

### Exercices & révision  
- On peut lancer un exercice à partir d’un deck.  
- Les cartes s’affichent avec un chrono, comme dans un petit jeu.  
- On sait immédiatement si une réponse est correcte ou non, et les erreurs réapparaissent plus tard pour aider à apprendre.  
- À la fin, on obtient un score ainsi que le temps mis pour compléter l’exercice.

### Pages et navigation  
- On utilise Edge pour générer les pages (login, création des decks/cartes, exercice, etc.).  
- Des messages s’affichent pour indiquer si une opération a réussi ou s’il y a eu une erreur.  
- Le site fonctionne bien sur mobile, et la navigation est simple (boutons, liens, tout est facilement cliquable).

## Dockerisation

### docker-compose  
- On utilise `docker-compose` pour lancer l’application (AdonisJS + base MySQL).  
- Les services sont correctement configurés avec les bonnes variables (nom de la BDD, utilisateur, mot de passe, etc.).  
- Les données sont stockées dans un volume (`dbdata`) pour ne pas les perdre à chaque redémarrage.  
- Un réseau personnalisé (`flashcards_network`) est défini pour permettre aux conteneurs de communiquer sans problème.

### Dockerfiles  
- L’application possède son propre Dockerfile (`adonis.dockerfile`).  
- On utilise les images appropriées (MySQL, Node.js), et les informations sensibles sont stockées dans le fichier `.env`.
