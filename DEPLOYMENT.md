# 🚀 Guide de Déploiement DeckStorm

Ce guide vous accompagne dans le déploiement de DeckStorm en production.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Déploiement rapide](#déploiement-rapide)
- [Configuration](#configuration)
- [GitHub Actions](#github-actions)
- [Maintenance](#maintenance)
- [Dépannage](#dépannage)

## Prérequis

### Serveur

- **OS** : Windows 10+
- **RAM** : Minimum 2GB (4GB recommandé)
- **Stockage** : Minimum 20GB
- **Docker** : Version 20.10+
- **Docker Compose** : Version 2.0+

### Domaine et SSL

- Un nom de domaine pointant vers votre serveur
- Ports 80 et 443 ouverts

## Déploiement rapide

### 1. Installation sur le serveur

```bash
# Se connecter au serveur
ssh user@votreserveur.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cloner le repository
git clone https://github.com/votre-username/DeckStorm.git
cd DeckStorm
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env.production

# Éditer la configuration
nano .env.production
```

**Variables importantes à configurer** :

```env
NODE_ENV=production
APP_KEY=<générer-avec-node-ace-generate:key>
HOST=0.0.0.0

# Database
DB_HOST=mysql
DB_PASSWORD=<mot-de-passe-fort>
DB_ROOT_PASSWORD=<mot-de-passe-root-fort>

# OAuth (URLs de production)
GOOGLE_CALLBACK_URL=https://votredomaine.com/auth/google/callback
GITHUB_CALLBACK_URL=https://votredomaine.com/auth/github/callback
```

### 3. Configuration SSL

```bash
# Installer Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtenir le certificat SSL
sudo certbot certonly --standalone -d votredomaine.com

# Créer le dossier SSL pour Nginx
mkdir -p nginx/ssl

# Copier les certificats
sudo cp /etc/letsencrypt/live/votredomaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votredomaine.com/privkey.pem nginx/ssl/
```

### 4. Modifier la configuration Nginx

```bash
# Éditer nginx.conf
nano nginx/nginx.conf

# Remplacer "votredomaine.com" par votre vrai domaine
```

### 5. Lancer l'application

```bash
# Construire et démarrer les conteneurs
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 6. Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose -f docker-compose.prod.yml exec app node ace migration:run --force

# (Optionnel) Seeder les données de test
docker-compose -f docker-compose.prod.yml exec app node ace db:seed
```

### 7. Vérifier le déploiement

Visitez `https://votredomaine.com` - votre application devrait être en ligne ! 🎉

## Configuration

### Renouvellement automatique SSL

```bash
# Créer un script de renouvellement
sudo nano /etc/cron.weekly/renew-ssl

# Ajouter :
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/votredomaine.com/*.pem /chemin/vers/DeckStorm/nginx/ssl/
docker-compose -f /chemin/vers/DeckStorm/docker-compose.prod.yml restart nginx

# Rendre exécutable
sudo chmod +x /etc/cron.weekly/renew-ssl
```

### Backup automatique

Le système inclut un service de backup automatique qui s'exécute quotidiennement.

```bash
# Voir les backups
ls -lh backups/

# Restaurer un backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u deckstorm_user -p deckstorm_prod < backups/deckstorm_backup_20260112_120000.sql.gz
```

## GitHub Actions

### Configuration des secrets

Dans votre repository GitHub, allez dans **Settings > Secrets and variables > Actions** et ajoutez :

- `SSH_PRIVATE_KEY` : Votre clé SSH privée
- `SERVER_HOST` : L'adresse IP ou le domaine de votre serveur
- `SERVER_USER` : Le nom d'utilisateur SSH
- `DEPLOY_PATH` : Le chemin vers le dossier de l'application (ex: `/home/user/DeckStorm`)

### Déploiement automatique

Le workflow GitHub Actions se déclenche automatiquement sur :

- Push sur la branche `main`
- Création d'un tag `v*`
- Déclenchement manuel

## Maintenance

### Mise à jour de l'application

```bash
# Sur le serveur
cd DeckStorm
git pull origin main

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# Exécuter les nouvelles migrations
docker-compose -f docker-compose.prod.yml exec app node ace migration:run --force
```

### Voir les logs

```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs -f app

# Logs Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Logs MySQL
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### Monitoring

```bash
# État des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Utilisation des ressources
docker stats

# Health check
curl https://votredomaine.com/health
```

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs app

# Vérifier la configuration
docker-compose -f docker-compose.prod.yml config

# Redémarrer les services
docker-compose -f docker-compose.prod.yml restart
```

### Erreur de base de données

```bash
# Vérifier que MySQL est démarré
docker-compose -f docker-compose.prod.yml ps mysql

# Se connecter à MySQL
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Réinitialiser les migrations (ATTENTION : efface les données)
docker-compose -f docker-compose.prod.yml exec app node ace migration:rollback --force
docker-compose -f docker-compose.prod.yml exec app node ace migration:run --force
```

### Problèmes SSL

```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Copier les nouveaux certificats
sudo cp /etc/letsencrypt/live/votredomaine.com/*.pem nginx/ssl/
docker-compose -f docker-compose.prod.yml restart nginx
```

## Sécurité

### Checklist de sécurité

- [ ] Pare-feu configuré (UFW)
- [ ] SSH avec clés uniquement (pas de mot de passe)
- [ ] Mots de passe de base de données forts
- [ ] HTTPS activé avec certificat valide
- [ ] Backups automatiques configurés
- [ ] Monitoring en place
- [ ] Logs régulièrement vérifiés
- [ ] Dépendances à jour

### Configuration du pare-feu

```bash
# Installer UFW
sudo apt-get install ufw

# Configurer les règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le pare-feu
sudo ufw enable
```

## Support

Pour plus d'informations, consultez :

- [Workflow de déploiement](.agent/workflows/deploy-production.md)
- [Configuration OAuth](OAUTH_SETUP.md)
- [Documentation AdonisJS](https://docs.adonisjs.com)

---

**Bon déploiement ! 🚀**
