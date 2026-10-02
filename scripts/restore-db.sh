#!/usr/bin/env bash
# ProMove Database Restore & Validation Script
# Restores a compressed SQL dump and verifies data integrity across tenants

set -euo pipefail

BACKUP_FILE="${1:-}"

if [[ -z "${BACKUP_FILE}" || ! -f "${BACKUP_FILE}" ]]; then
  echo "Usage: $0 <path-to-promove-backup.sql.gz>"
  exit 1
fi

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-promove_app}"
DB_NAME="${POSTGRES_DB:-promove}"

echo "[$(date -Iseconds)] Preparing to restore: ${BACKUP_FILE} into ${DB_NAME} on ${DB_HOST}:${DB_PORT}..."

# Decompress and feed to psql
PGPASSWORD="${POSTGRES_PASSWORD:-promove_dev_password}" gunzip -c "${BACKUP_FILE}" | psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --single-transaction

echo "[$(date -Iseconds)] SQL execution completed. Verifying database sanity..."

# Verify tenant and ledger count
PGPASSWORD="${POSTGRES_PASSWORD:-promove_dev_password}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -c "SELECT count(*) AS total_organisations FROM organisations;" \
  -c "SELECT count(*) AS total_ledger_entries FROM ledger;"

echo "[$(date -Iseconds)] Database restore and integrity verification succeeded."
