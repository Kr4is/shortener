# Website URL Shortener

Self-hosted URL shortener built with **Next.js**, **FastAPI**, and **PostgreSQL**. Designed to run entirely on your own infrastructure (e.g. Proxmox) with Docker — no Vercel or Supabase dependencies.

## Stack

- **Frontend:** Next.js 13 + React + Tailwind CSS (light/dark theme) + Recharts + Sonner
- **API:** FastAPI + SQLAlchemy + slowapi (rate limiting)
- **Database:** PostgreSQL 16 (Docker volume, automatic migrations on API start)
- **CI:** GitHub Actions (lint, tests, Docker build)
- **Python tooling:** uv (dependency management)
- **Quality:** pre-commit, Ruff, ESLint, Prettier

## Quick start (Docker)

```bash
git clone <repo-url>
cd shortener
cp .env.example .env   # set POSTGRES_PASSWORD
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000) to shorten URLs, or [http://localhost:3000/stats](http://localhost:3000/stats) for analytics.

Check services:

```bash
docker compose ps
curl http://localhost:3000/api/health
```

### Troubleshooting: API unhealthy / password authentication failed

PostgreSQL stores the password when the `postgres_data` volume is **first** created. If you later change `POSTGRES_PASSWORD` in `.env`, the API will use the new value but Postgres will still expect the old one.

Fix by recreating the volume (this deletes stored URLs):

```bash
docker compose down -v
docker compose up -d --build
```

Or set `POSTGRES_PASSWORD` in `.env` back to the password used when the volume was created.

## Upgrading without losing data

Your shortened URLs and click history live in the `postgres_data` Docker volume. Rebuilding images does **not** delete them.

**Safe upgrade:**

```bash
./scripts/backup.sh          # optional but recommended
./scripts/upgrade.sh         # git pull + rebuild + restart
```

Or manually:

```bash
docker compose up -d --build   # preserves volume
```

**Never use** `docker compose down -v` unless you intend to wipe all links.

On startup, the API automatically applies pending SQL migrations from [`db/migrations/`](db/migrations/) and records them in `schema_migrations`.

### Backup and restore

```bash
# Create timestamped dump in backups/
./scripts/backup.sh

# Restore (stops are recommended — script will prompt)
docker compose stop api
./scripts/restore.sh backups/shortener-YYYYMMDD-HHMM.sql
docker compose up -d
```

Manual alternative:

```bash
docker compose exec postgres pg_dump -U shortener shortener > backup.sql
docker compose exec -T postgres psql -U shortener shortener < backup.sql
```

## Local development

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) for Python dependency management.

### With Docker (recommended)

Start only PostgreSQL:

```bash
docker compose up -d postgres
cp .env.example .env
```

Run the API and frontend locally:

```bash
uv sync --group dev
export DATABASE_URL=postgresql+psycopg://shortener:change-me@localhost:5432/shortener
export RATE_LIMIT_ENABLED=false

# Terminal 1
uv run python -m api.migrate
uv run uvicorn api.index:app --reload

# Terminal 2
npm install
npm run dev
```

### Pre-commit

```bash
uv sync --group dev
pre-commit install
pre-commit run --all-files
```

## API endpoints

| Method   | Path               | Description                                                      |
| -------- | ------------------ | ---------------------------------------------------------------- |
| `GET`    | `/api/health`      | Health check (includes DB connectivity)                          |
| `POST`   | `/api/url`         | Create URL (`url`, optional `alias`, optional `expires_in_days`) |
| `GET`    | `/api/urls`        | List all shortened URLs with click stats                         |
| `GET`    | `/api/urls/export` | Export links as CSV                                              |
| `DELETE` | `/api/urls/{slug}` | Delete a shortened URL                                           |
| `GET`    | `/api/stats`       | Stats (`?from=YYYY-MM-DD&to=YYYY-MM-DD` optional)                |
| `GET`    | `/api/preview`     | Fetch page title preview (`?url=`)                               |
| `GET`    | `/s/{key}`         | Redirect to original URL (tracks click, HTML 404/410 on failure) |
| `GET`    | `/docs`            | FastAPI Swagger UI                                               |

Short links use the format `https://your-domain/s/{key}` or `https://your-domain/s/{custom-alias}` when a custom alias is set.

### Features

- **Theme toggle** — light/dark mode (navbar)
- **Custom aliases** — friendly slugs like `/s/my-link`
- **Link expiration** — optional 7/30/90-day expiry when creating URLs
- **QR codes** — generate QR from result card or stats table
- **Search** — filter links in the statistics table
- **Export CSV** — download all links from the stats page
- **Delete links** — remove URLs from the stats table
- **URL preview** — shows page title while typing a URL
- **Analytics** — daily clicks, top links, top referrers, date range filter
- **Rate limiting** — 20 req/min on create/delete, 100 req/min on redirects
- **API key auth** — optional `ADMIN_API_KEY` protects create/delete endpoints
- **Toast notifications** — feedback for copy, create, delete actions

### Database migrations

Migrations run automatically when the API container starts. Manual application is only needed if you run the API outside Docker without the entrypoint:

```bash
uv run python -m api.migrate
```

Migration files live in [`db/migrations/`](db/migrations/). Fresh installs use the full schema in [`db/init.sql`](db/init.sql).

## Environment variables

| Variable               | Description                                       | Default           |
| ---------------------- | ------------------------------------------------- | ----------------- |
| `POSTGRES_USER`        | PostgreSQL user                                   | `shortener`       |
| `POSTGRES_PASSWORD`    | PostgreSQL password                               | —                 |
| `POSTGRES_DB`          | Database name                                     | `shortener`       |
| `DATABASE_URL`         | SQLAlchemy connection string                      | —                 |
| `WEB_PORT`             | Host port for the web service                     | `3000`            |
| `FASTAPI_INTERNAL_URL` | Internal API URL for Next.js rewrites             | `http://api:8000` |
| `ADMIN_API_KEY`        | Require `X-API-Key` header on POST/DELETE         | (disabled)        |
| `NEXT_PUBLIC_API_KEY`  | API key sent from browser (build-time for Docker) | (disabled)        |
| `RATE_LIMIT_ENABLED`   | Enable rate limiting                              | `true`            |

See [`.env.example`](.env.example) for a full template.

### Securing a public deployment

1. Set `ADMIN_API_KEY` in `.env` and rebuild the web image with matching `NEXT_PUBLIC_API_KEY`.
2. Or protect the whole app with Basic Auth on your reverse proxy (Caddy, Nginx, Traefik) — often safer than exposing the key in the browser.
3. Keep `RATE_LIMIT_ENABLED=true` in production.

## Deploy on Proxmox

1. Create an LXC/VM with Docker installed.
2. Clone the repository and configure `.env`.
3. Run `docker compose up -d --build`.
4. Put a reverse proxy in front of port 3000 for HTTPS.
5. Schedule `./scripts/backup.sh` via cron for periodic dumps.

## Testing

```bash
docker compose up -d postgres
uv sync --group dev
uv run pytest -v
npm run lint
npm run format:check
```

Tests load `DATABASE_URL` from `.env` automatically and disable rate limiting.

## Project structure

```
├── api/              # FastAPI backend (includes migrate.py)
├── app/              # Next.js frontend (/, /stats)
├── components/       # UI components
├── scripts/          # backup.sh, restore.sh, upgrade.sh, entrypoint-api.sh
├── db/init.sql       # PostgreSQL schema (fresh installs)
├── db/migrations/    # SQL migrations (auto-applied on API start)
├── tests/            # API integration tests
├── pyproject.toml    # Python dependencies (uv)
├── uv.lock
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── .github/workflows/ci.yaml
```

## License

See [LICENSE](LICENSE).
