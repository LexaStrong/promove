#!/usr/bin/env bash
# ProMove Database Backup Script
# Performs automated daily PostgreSQL dump with gzip compression and retention pruning

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/promove}"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-promove_app}"
DB_NAME="${POSTGRES_DB:-promove}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/promove_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -Iseconds)] Starting ProMove database backup: ${DB_NAME} on ${DB_HOST}:${DB_PORT}..."

# Export database dump directly compressed
PGPASSWORD="${POSTGRES_PASSWORD:-promove_dev_password}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges | gzip > "${BACKUP_FILE}"

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -Iseconds)] Backup completed successfully: ${BACKUP_FILE} (Size: ${FILE_SIZE})"

# Prune old backups older than retention limit
echo "[$(date -Iseconds)] Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "promove_backup_*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date -Iseconds)] Backup routine finished cleanly."
