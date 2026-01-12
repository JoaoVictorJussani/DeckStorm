---
description: Déployer DeckStorm en production
---

# Workflow de déploiement en production

Ce workflow guide le déploiement de DeckStorm vers un environnement de production.

## Prérequis

- Accès SSH au serveur de production
- Docker et Docker Compose installés sur le serveur
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)

## Étapes de déploiement

### 1. Préparer le code pour la production

```bash
# S'assurer que toutes les dépendances sont à jour
npm install

# Construire l'application
npm run build

# Exécuter les tests
npm test
```

### 2. Configurer les variables d'environnement de production

Créer un fichier `.env.production` sur le serveur avec :

```bash
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
APP_KEY=<générer-avec-node-ace-generate:key>
LOG_LEVEL=info

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=deckstorm_user
DB_PASSWORD=<mot-de-passe-sécurisé>
DB_DATABASE=deckstorm_prod

# Session
SESSION_DRIVER=file

# OAuth (avec URLs de production)
GOOGLE_CLIENT_ID=<votre-client-id-prod>
GOOGLE_CLIENT_SECRET=<votre-client-secret-prod>
GOOGLE_CALLBACK_URL=https://votredomaine.com/auth/google/callback

GITHUB_CLIENT_ID=<votre-client-id-prod>
GITHUB_CLIENT_SECRET=<votre-client-secret-prod>
GITHUB_CALLBACK_URL=https://votredomaine.com/auth/github/callback
```

### 3. Créer le fichier Docker Compose pour la production

Créer `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - '3333:3333'
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mysql
    restart: unless-stopped
    volumes:
      - ./tmp:/app/tmp
      - ./uploads:/app/uploads

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

### 4. Créer le Dockerfile de production

Créer `Dockerfile.prod` :

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Image de production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Créer les dossiers nécessaires
RUN mkdir -p tmp/sessions uploads

# Exposer le port
EXPOSE 3333

# Démarrer l'application
CMD ["node", "build/bin/server.js"]
```

### 5. Configurer Nginx comme reverse proxy

Créer `nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3333;
    }

    server {
        listen 80;
        server_name votredomaine.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name votredomaine.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 10M;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 6. Déployer sur le serveur

```bash
# Se connecter au serveur
ssh user@votreserveur.com

# Cloner le repository (ou pull les dernières modifications)
git clone https://github.com/votre-repo/DeckStorm.git
cd DeckStorm

# Ou mettre à jour
git pull origin main

# Copier le fichier .env.production
cp .env.production .env

# Générer la clé d'application
node ace generate:key

# Lancer les conteneurs
docker-compose -f docker-compose.prod.yml up -d --build

# Exécuter les migrations
docker-compose -f docker-compose.prod.yml exec app node ace migration:run --force

# (Optionnel) Seeder les données initiales
docker-compose -f docker-compose.prod.yml exec app node ace db:seed
```

### 7. Configurer SSL avec Let's Encrypt

```bash
# Installer certbot
sudo apt-get update
sudo apt-get install certbot

# Obtenir le certificat
sudo certbot certonly --standalone -d votredomaine.com

# Copier les certificats dans le dossier ssl
sudo cp /etc/letsencrypt/live/votredomaine.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/votredomaine.com/privkey.pem ./ssl/

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 8. Configurer le renouvellement automatique SSL

```bash
# Ajouter un cron job pour renouveler le certificat
sudo crontab -e

# Ajouter cette ligne (renouvellement tous les lundis à 3h du matin)
0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/votredomaine.com/*.pem /chemin/vers/DeckStorm/ssl/ && docker-compose -f /chemin/vers/DeckStorm/docker-compose.prod.yml restart nginx
```

### 9. Monitoring et logs

```bash
# Voir les logs de l'application
docker-compose -f docker-compose.prod.yml logs -f app

# Voir les logs nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Voir l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps
```

### 10. Mise à jour de l'application

Pour déployer une nouvelle version :

```bash
# Sur le serveur
cd DeckStorm
git pull origin main

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# Exécuter les nouvelles migrations si nécessaire
docker-compose -f docker-compose.prod.yml exec app node ace migration:run --force
```

## Sécurité

- ✅ Utiliser HTTPS uniquement
- ✅ Configurer un pare-feu (UFW recommandé)
- ✅ Limiter l'accès SSH (clés SSH uniquement)
- ✅ Sauvegardes régulières de la base de données
- ✅ Mettre à jour régulièrement les dépendances
- ✅ Utiliser des mots de passe forts pour la base de données
- ✅ Configurer les CORS si nécessaire
- ✅ Activer les logs d'audit

## Sauvegarde de la base de données

```bash
# Créer une sauvegarde
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u deckstorm_user -p deckstorm_prod > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u deckstorm_user -p deckstorm_prod < backup_20260112.sql
```

## Rollback en cas de problème

```bash
# Revenir à la version précédente
git checkout <commit-précédent>
docker-compose -f docker-compose.prod.yml up -d --build

# Ou utiliser les tags git
git checkout v1.0.0
docker-compose -f docker-compose.prod.yml up -d --build
```

## Checklist de déploiement

- [ ] Tests passent en local
- [ ] Variables d'environnement configurées
- [ ] Certificat SSL configuré
- [ ] Base de données sauvegardée
- [ ] OAuth configuré avec URLs de production
- [ ] Migrations exécutées
- [ ] Application accessible via HTTPS
- [ ] Logs vérifiés
- [ ] Monitoring en place
