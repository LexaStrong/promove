# Architecture

## Purpose and status

ProMove is a Next.js fleet-operations prototype for transport operators in Ghana. This guide distinguishes implemented UI and domain scaffolding from production integrations. The repository is not yet a production multi-tenant application: the current auth provider is a demo, most screens use seeded data/client-side state, and the PostgreSQL/Redis containers are not connected to application repositories.

## Stack

- Next.js 16 App Router and React 19
- TypeScript 5
- Tailwind CSS v4 with shared design tokens in `src/app/globals.css`
- Leaflet for fleet map rendering; Recharts for charts
- Node.js 20 container runtime
- PostgreSQL 16 schema and Redis 7 are provisioned by Docker Compose for local infrastructure work

## Route map

### Public and account

- `/`: product overview and primary calls to action
- `/privacy`: privacy policy and an in-page request form; submission currently creates local UI confirmation only
- `/login`, `/register`: demo login and simulated organization registration

### Fleet workspace

`/dashboard`, `/vehicles`, `/vehicles/[id]`, `/drivers`, `/drivers/[id]`, `/trips`, `/live-map`, `/ledger`, `/fuel`, `/maintenance`, `/documents`, `/incidents`, `/reports`, `/intelligence`, `/notifications`, and `/settings` are composed through the `(dashboard)` route group and shared `AppShell`.

### Driver and APIs

- `/driver-app`: driver-facing PWA surface
- `/api/health`: returns a health-shaped response; its database, Redis, storage, and compliance fields are currently constants, not live probes
- `/api/gps/positions`: emits one seeded SSE snapshot and closes the stream; it is not a live Traccar connection
- `/api/payments/callback`: provider-shaped callback validation and in-memory demo logging
- `/api/payments/status-check`: payment status-check scaffold

## Runtime boundaries

### Authentication and authorization

`src/lib/auth-context.tsx` initializes a demo owner session. Login ignores password and TOTP values and selects a seeded role from the submitted phone number. Role switching is client-side. This is suitable for a demonstrator, not an access-control boundary. Do not use it with real users or sensitive data.

### Data and persistence

`src/lib/mock-data.ts` supplies representative data to screens. `docker/init-db.sql` describes a multi-tenant relational schema, integer-pesewa finance, audit records, and RLS policies. No runtime DB client or transaction layer currently uses that schema. The SQL is a bootstrap script mounted by Compose on first database initialization; there is no migration runner.

`src/lib/storage.ts` validates file MIME types and constructs example object-storage URLs, but it does not upload objects or create cryptographically signed URLs. Payment/SMS providers are interfaces and sandbox/demo implementations; connect real providers only after secret handling, signature validation, persistence, idempotency, and consent flows are in place.

### GPS and offline behavior

GPS helpers in `src/lib/gps/` adapt position/status data. The API currently supplies fixed sample positions. `public/sw.js` precaches a small set of public routes/assets and uses a network-first navigation fallback. This does not make the full dashboard data layer offline-ready by itself; offline queue behavior is tested as domain logic but must be connected to durable browser storage and a real sync endpoint.

## Data model

The SQL bootstrap contains organisations, users, vehicles, drivers, vehicle assignments, ledger entries, fuel logs, vehicle documents, maintenance schedules/records, incidents, trips, audit logs, payments, and partitioned GPS positions. Monetary values use integer pesewas (`100 pesewas = GH₵1`). Business records carry `org_id`; the SQL includes RLS policies based on `app.current_org_id`. Until a server-side data layer sets that value from an authenticated session on every transaction, the policies are not runtime tenant isolation.

## Repository map

- `src/app/`: pages, route layouts, API handlers, root metadata, sitemap, robots
- `src/components/`: shared application shell and map/auth components
- `src/lib/`: auth demo, data fixtures, types, storage/provider interfaces, GPS helpers
- `docker/`: PostgreSQL bootstrap schema
- `scripts/`: database backup and restore scripts
- `tests/`: node:test domain tests
- `public/`: PWA service worker, manifest, branding, and status images
- `docs/`: architecture, roadmap, and SEO operating notes

## Local workflow

1. Install dependencies with `npm install`.
2. Run `npm run dev` and use `http://localhost:3000`.
3. Optional: start local services with `docker compose up -d postgres redis`. The app does not currently consume them.
4. Run `npm test`, `npm exec next typegen`, `npm exec tsc -- --noEmit`, `npm run lint`, and `npm run build` as appropriate.
5. `docker compose up --build` also builds and starts the web container. Compose credentials and exposed ports are development-only.

See the root README for the role demo logins, scripts, and route overview. See the roadmap for the gates required before production use.
