# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors (public):** anyone who reaches the home page with a long URL they want to share. They paste, optionally choose an alias and an expiry, copy the short link, and leave. Many visits are a few seconds long; some come back to see the links they made earlier.
- **Operator (owner/admin):** the person who self-hosts the instance (homelab, Proxmox, Docker). They look at clicks, referrers, and the full link inventory; they delete or adjust links and export CSV.

## Product Purpose

Turn a long URL into a short `/s/<slug>` link on infrastructure the operator controls, and show who clicked it, when, and from where. Success: a visitor gets a working, copyable link in one paste and one keystroke; the operator can answer "is this link being used, and from where?" within seconds.

## Positioning

Self-hosted and dependency-free: Next.js + FastAPI + PostgreSQL in Docker, no Vercel, Supabase, or third-party analytics. Click data stays in the operator's own database.

## Operating Context

- Deployed with `docker compose` on the operator's own hardware; images published to ghcr.io.
- Short links are shared on social and chat platforms (LinkedIn, X, Bluesky, Telegram, Hacker News appear as referrers).
- Data lives in the `postgres_data` volume; backups and upgrades via `scripts/`.

## Capabilities and Constraints

- Create short link: URL (http/https), optional custom alias (3–32 chars, letters/digits/hyphens, reserved words blocked), optional expiry (never / 7 / 30 / 90 days). Re-submitting an existing URL returns its existing slug.
- Page-title preview of the destination while typing.
- Redirect at `/s/<slug>`; expired links return 410, unknown links 404.
- Click tracking per event with timestamp, referrer, user agent.
- Stats: totals, clicks per day, top links, top referrers, 7/30/90-day or custom range, sortable and filterable link table, CSV export, delete link.
- Per-link detail: daily clicks, referrers, change or remove expiry, expire now, QR download (PNG/SVG).
- Home keeps a "Your links" list of links created in this browser (localStorage only).
- Optional `ADMIN_API_KEY` protects create, update and delete. Stats and the link list stay public by owner decision (2026-11-06); revisit only if the owner asks.
- Terminology: "short link", "alias", "slug", "clicks", "referrer", "expires".
- UI copy is in English.

## Brand Commitments

- Name: **Shortener**.
- Visual direction (owner, 2026-11-06): professional and unobtrusive, with depth; a terminal/monospaced look was tried and rejected.
- The app includes an informational page (/about) explaining what it does.

## Evidence on Hand

- No testimonials, customers, usage figures, or benchmarks exist. Do not invent any.
- Icon assets: `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico`.

## Product Principles

1. One paste, one keystroke: shortening must never need more than the URL.
2. Show the link, not the product: the result and the data are the content; no marketing sections on a working tool.
3. The operator's data is the operator's: nothing leaves the instance.
4. Every link's state is legible at a glance: active, expiring, expired, clicked or not.
