# Website URL Shortener

Self-hosted URL shortener built with **Next.js**, **FastAPI**, and **PostgreSQL**. Designed to run entirely on your own infrastructure (e.g. Proxmox) with Docker — no Vercel or Supabase dependencies.

## Stack

- **Frontend:** Next.js 13 + React + Tailwind CSS (light/dark theme) + Recharts
- **API:** FastAPI + SQLAlchemy
- **Database:** PostgreSQL 16 (Docker volume)
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

# Terminal 1
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

| Method   | Path               | Description                                                    |
| -------- | ------------------ | -------------------------------------------------------------- |
| `GET`    | `/api/health`      | Health check (includes DB connectivity)                        |
| `POST`   | `/api/url`         | Create a shortened URL (`{"url": "...", "alias": "optional"}`) |
| `GET`    | `/api/urls`        | List all shortened URLs with click stats                       |
| `DELETE` | `/api/urls/{slug}` | Delete a shortened URL                                         |
| `GET`    | `/api/stats`       | Summary stats, daily clicks, top links                         |
| `GET`    | `/s/{key}`         | Redirect to the original URL (tracks click)                    |
| `GET`    | `/docs`            | FastAPI Swagger UI                                             |

Short links use the format `https://your-domain/s/{key}` or `https://your-domain/s/{custom-alias}` when a custom alias is set.

### Features

- **Theme toggle** — switch between light and dark mode (navbar, top-right)
- **Custom aliases** — optional friendly slugs like `/s/my-link` when creating URLs
- **QR codes** — generate QR for any short link from the result card or stats table
- **Search** — filter links in the statistics table by URL or slug
- **Delete links** — remove shortened URLs from the stats table

### Database migrations (existing deployments)

```bash
# Click tracking (if upgrading from pre-stats version)
docker compose exec -T postgres psql -U shortener shortener < db/migrations/001_add_click_tracking.sql

# Custom aliases
docker compose exec -T postgres psql -U shortener shortener < db/migrations/002_add_custom_slug.sql
```

Fresh installs use the updated [`db/init.sql`](db/init.sql) automatically.

## Environment variables

| Variable               | Description                           | Default           |
| ---------------------- | ------------------------------------- | ----------------- |
| `POSTGRES_USER`        | PostgreSQL user                       | `shortener`       |
| `POSTGRES_PASSWORD`    | PostgreSQL password                   | —                 |
| `POSTGRES_DB`          | Database name                         | `shortener`       |
| `DATABASE_URL`         | SQLAlchemy connection string          | —                 |
| `WEB_PORT`             | Host port for the web service         | `3000`            |
| `FASTAPI_INTERNAL_URL` | Internal API URL for Next.js rewrites | `http://api:8000` |

See [`.env.example`](.env.example) for a full template.

## Deploy on Proxmox

1. Create an LXC/VM with Docker installed.
2. Clone the repository and configure `.env`.
3. Run `docker compose up -d --build`.
4. (Optional) Put a reverse proxy (Caddy, Nginx, Traefik) in front of port 3000 for HTTPS.

### Database backup

```bash
# Dump
docker compose exec postgres pg_dump -U shortener shortener > backup.sql

# Restore
docker compose exec -T postgres psql -U shortener shortener < backup.sql
```

Or back up the `postgres_data` Docker volume periodically.

## Testing

```bash
docker compose up -d postgres
export DATABASE_URL=postgresql+psycopg://shortener:change-me@localhost:5432/shortener
uv sync --group dev
uv run pytest -v
npm run lint
npm run format:check
```

## Project structure

```
├── api/              # FastAPI backend
├── app/              # Next.js frontend (/, /stats)
├── components/       # UI components
├── db/init.sql       # PostgreSQL schema
├── db/migrations/    # SQL migrations for upgrades
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
