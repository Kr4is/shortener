#!/bin/bash
# Entrypoint for Dockerfile.preview: ephemeral Postgres + API + web in one container.
set -euo pipefail

APP_DIR=${APP_DIR:-/app}
WEB_DIR=${WEB_DIR:-$APP_DIR/web}
PGBIN=${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)}
PGDATA=${PGDATA:-/tmp/pgdata}
PGSOCK=${PGSOCK:-/tmp}
PGPORT=${PGPORT:-5432}

"$PGBIN/initdb" -D "$PGDATA" -U shortener --auth=trust -E UTF8 >/dev/null
"$PGBIN/pg_ctl" -D "$PGDATA" -w -l /tmp/postgres.log \
  -o "-c listen_addresses=127.0.0.1 -p $PGPORT -k $PGSOCK" start
"$PGBIN/createdb" -h 127.0.0.1 -p "$PGPORT" -U shortener shortener

psql() { "$PGBIN/psql" -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$PGPORT" -U shortener shortener "$@"; }
psql -f "$APP_DIR/db/init.sql"
(cd "$APP_DIR" && python -m api.migrate)
psql -f "$APP_DIR/scripts/preview-seed.sql"

(cd "$APP_DIR" && exec uvicorn api.index:app --host 127.0.0.1 --port "${API_PORT:-8000}") &
(cd "$WEB_DIR" && PORT=${PORT:-8080} HOSTNAME=0.0.0.0 exec node server.js) &

# Exit (and let the pod restart) as soon as either process dies.
wait -n
exit 1
