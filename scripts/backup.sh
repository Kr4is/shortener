#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

POSTGRES_USER="${POSTGRES_USER:-shortener}"
POSTGRES_DB="${POSTGRES_DB:-shortener}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M)"
OUTPUT="$BACKUP_DIR/shortener-${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Backing up database to $OUTPUT..."
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$OUTPUT"
echo "Backup complete: $OUTPUT"
