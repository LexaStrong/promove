# ProMove

ProMove is a mobile-first fleet operations application for Ghanaian transport businesses. The interface brings vehicle and driver registries, trip visibility, daily financial workflows, maintenance, documents, incidents, reports, and a driver PWA into one workspace.

## Project Status

This repository is a working product prototype. Many screens use seeded demo data and client-side state. The database schema, provider interfaces, Docker services, and domain tests are foundations, not proof that production services are wired end to end.

In particular, `AuthProvider` accepts demo logins without validating passwords or TOTP, the GPS endpoint streams fixed mock positions, provider implementations do not make real Hubtel/S3 requests, and the health endpoint currently reports configured services without probing them. Do not expose this build or its demo data as a production service. See [Architecture](docs/architecture.md) and [Roadmap](docs/roadmap.md) for current boundaries and launch blockers.

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop only if you want the local Postgres/Redis services

## Run Locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app starts with a demo owner session. The login page also has quick demo actions for owner, manager, driver, viewer, and platform administrator roles. These are for local demonstration only.

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the canonical public origin. It defaults to `https://promove.gh` for generated canonical links, sitemap URLs, and robots directives. This value is public, not a secret.

## Commands

```bash
npm run dev
npm run lint
npm test
npm exec next typegen
npm exec tsc -- --noEmit
npm run build
npm start
```

Run `next typegen` before standalone TypeScript checks when Next.js route types are stale. `npm test` runs the current domain tests for tenancy isolation, money flows, offline sync, report loads, provider sandbox behavior, and GPS tracking.

## Docker Development

`docker compose up --build` starts the web app plus PostgreSQL 16 and Redis 7. The compose file uses checked-in development credentials and exposes service ports; use it only on a trusted local machine. The web application is not yet connected to the Postgres/Redis services, so starting them does not make mock screens persistent.

The database bootstrap schema is in [`docker/init-db.sql`](docker/init-db.sql). It is mounted as a first-initialization script; it is not a versioned migration system.

## Application Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/privacy` |
| Account | `/login`, `/register` |
| Fleet operations | `/dashboard`, `/vehicles`, `/drivers`, `/trips`, `/live-map`, `/ledger`, `/fuel`, `/maintenance`, `/documents`, `/incidents`, `/reports`, `/intelligence`, `/notifications`, `/settings` |
| Driver | `/driver-app` |
| Health and integrations | `/api/health`, `/api/gps/positions`, `/api/payments/callback`, `/api/payments/status-check` |
| Search metadata | `/robots.txt`, `/sitemap.xml` |

Private application surfaces are marked `noindex` and excluded from the sitemap. Only the public landing and privacy pages are listed for search crawlers.

## Documentation

- [Architecture and current system boundaries](docs/architecture.md)
- [Prioritized delivery roadmap](docs/roadmap.md)
- [SEO implementation and operating checklist](docs/seo.md)

## Deployment Notes

The Docker image is a multi-stage Next.js build. Before production, complete the P0 work in the roadmap: real server-side authentication and authorization, tenant-scoped persistence, verified integrations, secret management, and truthful health checks. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and verify `/robots.txt`, `/sitemap.xml`, canonical tags, and social previews against that deployed host.
