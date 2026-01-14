#!/bin/bash

# Script de backup automatique pour DeckStorm
# Ce script crée une sauvegarde de la base de données PostgreSQL

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="deckstorm_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Créer le dossier de backup s'il n'existe pas
mkdir -p ${BACKUP_DIR}

echo "🔄 Démarrage du backup à $(date)"

# Exporter le mot de passe pour pg_dump
export PGPASSWORD=${DB_PASSWORD}

# Créer le backup
pg_dump -h ${DB_HOST} \
        -U ${DB_USER} \
        ${DB_DATABASE} \
        > ${BACKUP_DIR}/${BACKUP_FILE}

# Nettoyer la variable mot de passe
unset PGPASSWORD

# Compresser le backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

echo "✅ Backup créé: ${BACKUP_FILE}.gz"

# Nettoyer les anciens backups (garder seulement les X derniers jours)
find ${BACKUP_DIR} -name "deckstorm_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "🧹 Anciens backups nettoyés (> ${RETENTION_DAYS} jours)"

# Afficher l'espace disque utilisé
du -sh ${BACKUP_DIR}

echo "✅ Backup terminé à $(date)"
