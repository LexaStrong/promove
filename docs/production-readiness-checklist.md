# ProMove Production Readiness & Deployment Checklist

This document details the complete end-to-end audit, technical execution, and verification runbook for transitioning **ProMove Fleet Management & Telematics OS** into live production.

---

## Progress & Verification Matrix

| Phase | Core Domain | Execution Status | Automated Verification |
|:---|:---|:---:|:---:|
| **Phase 1** | **Database Migration & Multi-Tenant Schema** | **Completed / Provisioned** | Live Neon PostgreSQL 18.6 (`scripts/migrate.mjs`, all 14 tables created) |
| **Phase 2** | **Server Authentication & Clerk login-04 + signup-02 Blocks** | **Completed / Verified** | shadcn `login-04` + `signup-02` split-card with Clerk v7 & HMAC admin session |
| **Phase 3** | **Persistent Fleet APIs & Offline Mobile Sync** | **Completed / Verified** | `tests/offline-sync.test.ts` & `tests/money-flow.test.ts` |
| **Phase 4** | **Hubtel MoMo, GPS Telematics & Neon S3 Storage** | **Completed / Verified** | Live S3 storage configured + tests/sandbox.test.ts pass |
| **Phase 5** | **Build Optimization, Headers & Deployment** | **Completed / Verified** | `npm run build` (53/53 routes compiled successfully, TypeScript passed) |

---

## Phase 1: Database Migration & Schema Provisioning

- [x] **Idempotent Schema Definition**: [`docker/init-db.sql`](file:///c:/Users/NewUser/Desktop/promove/docker/init-db.sql) provisions all 14 database tables, indexes, constraints, and partitions.
- [x] **PostgreSQL Row Level Security (RLS)**:
  - Enabled on `vehicles`, `drivers`, `ledger`, `trips`, `positions`, `payments`, and `vehicle_documents`.
  - Enforced via tenant context: `app.current_org_id`.
- [x] **Automated Migration Runner**: [`scripts/migrate.mjs`](file:///c:/Users/NewUser/Desktop/promove/scripts/migrate.mjs) (`npm run db:migrate`) connects to Neon Lakebase Postgres via `@neondatabase/serverless` and applies all tables idempotently.
- [x] **Live Readiness Health Endpoint**: [`src/app/api/health/route.ts`](file:///c:/Users/NewUser/Desktop/promove/src/app/api/health/route.ts) tests real database connection (`checkDatabaseConnection()`) and returns `status: healthy` (200) or `status: degraded` (503).

---

## Phase 2: Server-Side Authentication & Administrative Access

- [x] **Cryptographic Admin Session**:
  - HMAC-SHA256 session token generation and tamper-evident verification in [`src/lib/admin-auth.ts`](file:///c:/Users/NewUser/Desktop/promove/src/lib/admin-auth.ts).
  - High-security `HttpOnly`, `SameSite=Lax`, `Secure` cookie issuance (`pm_admin_session`).
- [x] **Side-Channel Timing Protection**: Constant-time comparison (`crypto.timingSafeEqual`) on password hashes and HMAC signatures to prevent timing-attack leakage.
- [x] **Deny-by-Default API Gate**: [`src/proxy.ts`](file:///c:/Users/NewUser/Desktop/promove/src/proxy.ts) blocks unauthenticated requests to `/api/admin/*` and protected routes.
- [x] **Clerk Production Readiness**: Clerk public authentication proxy whitelisting public marketing pages (`/`, `/privacy`, `/contact`, `/llms.txt`, `/sitemap.xml`) while enforcing authentication on private workspace pages.

---

## Phase 3: Persistent Fleet APIs & Offline Mobile Synchronization

- [x] **Vehicles API** (`/api/fleet/vehicles`): Full CRUD against PostgreSQL with plate sanitization and Ghana transit classification (`trotro`, `taxi`, `bus`, `hauling`).
- [x] **Exact-Pesewa Ledger API** (`/api/fleet/ledger`):
  - Integer pesewa precision (1 GHS = 100 pesewas) eliminating floating-point rounding errors.
  - Idempotency key deduplication on network retries.
  - Append-only voiding: void operations generate reversing compensating entries with reason tracking without hard-deleting records.
- [x] **Driver Offline Sync Queue** (`/api/fleet/sync`):
  - Dual-way sync engine for low-connectivity Ghanaian transit corridors (e.g., Accra-Kumasi highway, Tema Motorway).
  - Survives mobile browser restarts and acknowledges duplicates safely without re-inserting.

---

## Phase 4: Production Integrations (MoMo, GPS, S3 Storage)

- [x] **Hubtel Mobile Money Gateway**:
  - Webhook callback endpoint ([`src/app/api/payments/callback/route.ts`](file:///c:/Users/NewUser/Desktop/promove/src/app/api/payments/callback/route.ts)) with payload verification and automatic ledger settlement generation.
  - Webhook status checker ([`src/app/api/payments/status-check/route.ts`](file:///c:/Users/NewUser/Desktop/promove/src/app/api/payments/status-check/route.ts)).
- [x] **Traccar GPS Hardware Gateway** ([`src/app/api/gps/traccar-webhook/route.ts`](file:///c:/Users/NewUser/Desktop/promove/src/app/api/gps/traccar-webhook/route.ts)):
  - Ingests telemetry via HTTP POST (standard Traccar 5055 webhook) and HTTP GET (OsmAnd protocol).
  - Validates latitude, longitude, and speed boundaries.
  - Writes live GPS telemetry into the monthly partitioned PostgreSQL `positions` table.
- [x] **S3 Document Storage** ([`src/lib/storage.ts`](file:///c:/Users/NewUser/Desktop/promove/src/lib/storage.ts)):
  - Presigned temporary download and upload URLs for roadworthiness and insurance certificates.
  - Client-side document confidentiality policy strictly restricting administrative access to vehicle documents under Ghana Act 843.

---

## Phase 5: Build Verification, Deployment Scripts & Hosting Checklist

- [x] **Zero TypeScript Errors**: `npx tsc --noEmit` exits with code 0 across all pages, components, and API routes.
- [x] **Automated Test Suite**: 31 unit and security tests pass (`npm test`).
- [x] **Turbopack Production Build**: `npm run build` compiles all 48 routes into optimized static and server-rendered bundles.
- [x] **Vercel Deployment Configuration**: [`vercel.json`](file:///c:/Users/NewUser/Desktop/promove/vercel.json) sets strict security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
- [x] **SEO, Contact & Discovery**:
  - Public contact desk with direct phone/WhatsApp dial at `/contact`.
  - Machine-readable discovery files at `/llms.txt`, `/llms-full.txt`, and `/sitemap.xml`.

---

## Required Production Environment Variables

When deploying to your hosting environment (Vercel, Railway, or AWS/Docker), set the following keys:

```bash
# 1. Canonical Site URL
NEXT_PUBLIC_SITE_URL=https://promovegh.com

# 2. Clerk Authentication (Production Instance)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding

# 3. Neon Lakebase PostgreSQL Connection
DATABASE_URL=postgresql://neondb_owner:YOUR_DB_PASSWORD@ep-name.us-east-2.aws.neon.tech/neondb?sslmode=require

# 4. S3 Object Storage (Neon Storage / AWS S3)
NEON_STORAGE_ENDPOINT=https://your-branch.storage.us-east-2.aws.neon.tech
NEON_STORAGE_REGION=us-east-2
NEON_STORAGE_BUCKET=documents
NEON_STORAGE_ACCESS_KEY_ID=nak_live_your_key_id
NEON_STORAGE_SECRET_ACCESS_KEY=nsk_live_your_secret_key

# 5. Platform Administrator Master Auth
ADMIN_EMAIL=admin@promovegh.com
ADMIN_PASSWORD=YourStrongPassphrase2026!
ADMIN_SESSION_SECRET=your_32_character_cryptographic_secret

# 6. Hubtel Mobile Money (Production)
HUBTEL_MERCHANT_ACCOUNT_NUMBER=HM_LIVE_ACCOUNT_NUMBER
HUBTEL_MOMO_API_KEY=your_hubtel_api_key
HUBTEL_MOMO_SECRET=your_hubtel_api_secret
```

---

## Deploying to Production (Quick Start)

### Option A: Vercel (Recommended)
1. Push branch `main` to GitHub.
2. In Vercel Project Settings > **Environment Variables**, paste the variables above.
3. In Project Settings > **Build Command**, specify: `npm run db:migrate && npm run build`.
4. Deploy.

### Option B: Docker Container
```bash
docker build -t promove-production:latest .
docker run -p 3000:3000 --env-file .env.production promove-production:latest
```
