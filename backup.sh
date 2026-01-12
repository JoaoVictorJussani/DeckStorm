#!/bin/bash

# Script de backup automatique pour DeckStorm
# Ce script crée une sauvegarde de la base de données MySQL

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="deckstorm_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Créer le dossier de backup s'il n'existe pas
mkdir -p ${BACKUP_DIR}

echo "🔄 Démarrage du backup à $(date)"

# Créer le backup
mysqldump -h ${MYSQL_HOST} \
          -u ${MYSQL_USER} \
          -p${MYSQL_PASSWORD} \
          ${MYSQL_DATABASE} \
          --single-transaction \
          --quick \
          --lock-tables=false \
          > ${BACKUP_DIR}/${BACKUP_FILE}

# Compresser le backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

echo "✅ Backup créé: ${BACKUP_FILE}.gz"

# Nettoyer les anciens backups (garder seulement les X derniers jours)
find ${BACKUP_DIR} -name "deckstorm_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "🧹 Anciens backups nettoyés (> ${RETENTION_DAYS} jours)"

# Afficher l'espace disque utilisé
du -sh ${BACKUP_DIR}

echo "✅ Backup terminé à $(date)"
