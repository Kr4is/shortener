#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Pulling latest changes..."
git pull

echo "==> Building images..."
docker compose build

echo "==> Starting services (data volume preserved)..."
docker compose up -d

echo "==> Waiting for API health..."
for i in $(seq 1 30); do
  if docker compose exec -T api curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "API is healthy."
    docker compose ps
    exit 0
  fi
  sleep 2
done

echo "API did not become healthy in time. Check logs:"
echo "  docker compose logs api"
exit 1
