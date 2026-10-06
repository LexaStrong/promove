# ProMove • Intelligent Fleet Operations & Telematics Platform

ProMove is an enterprise-grade, mobile-first fleet operations and telematics platform purpose-built for the commercial transport ecosystem in Ghana and West Africa. It unifies vehicle registries, driver management, real-time GPS hardware telematics, append-only financial accounting, statutory compliance, maintenance tracking, and central platform administration into a single workspace.

Designed for commercial minibuses (**trotros**), shared and private **taxis**, **intercity coaches**, and **hauling/logistics fleets**, ProMove replaces fragmented paper logbooks and informal mobile chats with an integrated, auditable digital backbone.

---

## Table of Contents

- [What ProMove Does](#what-promove-does)
- [Key Features & Capabilities](#key-features--capabilities)
  - [1. Real-Time Telematics & GPS Hardware Gateway](#1-real-time-telematics--gps-hardware-gateway)
  - [2. Multi-Tenant Fleet Operations](#2-multi-tenant-fleet-operations)
  - [3. Financial Ledger & Mobile Money (MoMo)](#3-financial-ledger--mobile-money-momo)
  - [4. Dedicated Platform Administration Portal](#4-dedicated-platform-administration-portal)
  - [5. Compliance & Regulatory Controls](#5-compliance--regulatory-controls)
  - [6. Multi-Platform Support (Web, Android & iOS)](#6-multi-platform-support-web-android--ios)
- [System Architecture](#system-architecture)
- [Security & Core Mitigation Model](#security--core-mitigation-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
- [Scripts & Automated Testing](#scripts--automated-testing)
- [API Reference](#api-reference)
- [Platform Administrator Credentials](#platform-administrator-credentials)

---

## What ProMove Does

In the Ghanaian commercial transit sector, vehicle owners often struggle with revenue leakage, untracked maintenance, lack of real-time visibility, and disputed daily remittances. ProMove addresses these challenges:

1. **Live Corridor Tracking:** Monitors vehicle coordinates, speed, heading, battery, and ignition status across key transit arteries (e.g., Tema Motorway, Kwame Nkrumah Circle, Mallam Junction, Achimota Neoplan Terminal, Kasoa Highway).
2. **Hardware Agnostic:** Ingests telemetry from physical GPS tracker hardware (GT06, Concox, TK103, Teltonika FMB920) and mobile driver devices (OsmAnd / Traccar Client protocol).
3. **Pesewa-Accurate Accounting:** Tracks daily sales, fuel expenditures, repairs, driver commissions, and Hubtel Mobile Money payouts with integer pesewa precision, preventing floating-point drift.
4. **Maintenance & Statutory Reminders:** Tracks roadworthy inspection expiries, insurance renewals, and servicing milestones with automated notification queues.
5. **Centralized Platform Governance:** Gives platform administrators complete multi-tenant oversight to supervise all platform vehicles, manage users, provision GPS device IMEIs on behalf of operators, and resolve corridor safety incidents.

---

## Key Features & Capabilities

### 1. Real-Time Telematics & GPS Hardware Gateway
- **Interactive Fleet Map:** Built with Leaflet, supporting open street map and satellite imagery, custom corridor tracklines, vehicle heading rotation, speed badges, and live breadcrumb trails.
- **Protocol Gateway (`/api/gps/traccar-webhook`):** Ingests standardized telemetry from Traccar Server (port 5055) and direct HTTP GET/POST OsmAnd packets.
- **Corridor Geofencing:** Automatic detection of terminal arrivals and departures (Circle Terminal, Kaneshie Market, Madina Zongo Junction, Tema Community 1, Achimota Neoplan).
- **Safety Violation Engine:** Real-time speed alerts when vehicles exceed safety thresholds (e.g., >80 km/h) and abnormal idling detection.

### 2. Multi-Tenant Fleet Operations
- **Isolated Fleet Workspaces:** Strict tenant boundary enforcement ensuring organizations cannot view or modify data belonging to other fleets.
- **Vehicle Registry:** Comprehensive specifications (make, model, year, body type, fuel type, seating capacity, odometer, GPS tracker IMEI).
- **Driver Profiles & Assignments:** Driver licensing classes, safety scores, emergency contacts, and active vehicle assignment history with commission structures (fixed daily target or percentage).

### 3. Financial Ledger & Mobile Money (MoMo)
- **Integer Pesewa Precision:** All financial transactions stored as integers (1 GHS = 100 pesewas) to eliminate rounding discrepancies.
- **Append-Only Accounting:** Reversals and adjustments create explicit balancing entries with audit reasons; ledger entries are never hard-deleted.
- **Hubtel Payment Integration:** Pre-wired webhooks and status checkers for automated Mobile Money collections across MTN Mobile Money, Telecel Cash, and AT Money.

### 4. Dedicated Platform Administration Portal (`/admin`)
- **Strict Cryptographic Authentication:** Dedicated administrator login requiring master credentials; issues a tamper-evident HMAC-SHA256 signed `HttpOnly` session cookie (`pm_admin_session`).
- **Dashboard Tab:** Live platform KPIs (Total Users, Total Vehicles, Active GPS Streams, Open Incidents, Telematics Uptime).
- **Users Management Tab:** Directory of all platform users, their organizations, contact details, and vehicle counts (strictly no passwords or hashes exposed). Includes a **Dedicated User Management View** where admins can assist users, register vehicles on their behalf, and provision GPS hardware IMEIs and protocols.
- **Vehicles Supervision Tab:** Central supervision roster and nationwide interactive map. Clicking any vehicle or map blip opens the **Dedicated Vehicle & Driver Modal**, displaying full vehicle specs, driver credentials, and live GPS coordinates, speed, and ignition status.
- **Incidents Tab:** Real-time incident feed for overspeed events, breakdowns, and geofence breaches, with an interactive resolution dialog and notes.
- **Reports Tab:** Aggregated analytics covering total fleet distance, vehicle utilization rates, speed compliance percentages, and corridor traffic patterns.

### 5. Compliance & Regulatory Controls
- **Ghana Act 843 Statutory Compliance:** Driver location and SMS notification consent is explicitly captured and logged before telemetry dispatches or dispatch prompts.
- **Encrypted Document Storage:** Vehicle roadworthy certificates, insurance stickers, and driver licenses stored via S3-compatible object storage with presigned temporary URLs.

### 6. Multi-Platform Support (Web, Android & iOS)
- **Web Application & Driver PWA (`/driver-app`):** Fully responsive desktop and mobile web interface with bottom navigation bar and offline sync queue.
- **Native Android App (`android/`):** Kotlin, Jetpack Compose, Retrofit, Coroutines, Material 3, and background GPS location services.
- **Native iOS App (`ios/`):** Swift, SwiftUI, URLSession, and CoreLocation.

---

## System Architecture

```
                      ┌──────────────────────────────────────┐
                      │   Client Layer (Web / iOS / Android) │
                      │  • Next.js App Router (PWA)          │
                      │  • Native Kotlin Jetpack Compose     │
                      │  • Native Swift SwiftUI              │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / WSS
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Next.js 16 Proxy / Middleware      │
                      │  • Deny-by-Default Access Control    │
                      │  • HMAC Admin Session Validation     │
                      │  • Defense-in-Depth Security Headers │
                      └──────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────┐               ┌───────────────────┐            ┌───────────────────┐
│ Clerk Auth   │               │ Neon Postgres     │            │ Telemetry Hub     │
│ • User RBAC  │               │ • Multi-Tenant    │            │ • Traccar Adapter │
│ • Sessions   │               │ • Parameterized   │            │ • Geofences       │
│ • Metadata   │               │ • Append-Only DB  │            │ • Live Positions  │
└──────────────┘               └───────────────────┘            └───────────────────┘
        │                                │                                │
        ▼                                ▼                                ▼
┌──────────────┐               ┌───────────────────┐            ┌───────────────────┐
│ Hubtel MoMo  │               │ Neon S3 Storage   │            │ Physical GPS      │
│ • Payments   │               │ • Documents Vault │            │ • GT06 / TK103    │
│ • Webhooks   │               │ • Presigned URLs  │            │ • Port 5055       │
└──────────────┘               └───────────────────┘            └───────────────────┘
```

---

## Security & Core Mitigation Model

ProMove implements a comprehensive security model aligned with OWASP Top 10 guidelines:

| Category | Mitigation Implementation |
| :--- | :--- |
| **Broken Access Control** | Next.js 16 `src/proxy.ts` enforces deny-by-default on all routes. `/api/admin/*` endpoints strictly require a verified HMAC admin token. `/api/admin/set-role` is permanently locked down with a `403 Forbidden` response. |
| **Injection Flaws** | All SQL queries in `@/lib/db.ts` and API routes use parameterized placeholders (`$1, $2, ...`). Inputs are sanitized using `sanitizePlainText()`, `sanitizePlateNumber()`, and coordinate validators in `@/lib/security.ts`. |
| **Authentication Failures** | Constant-time password verification (`crypto.timingSafeEqual`) prevents side-channel timing analysis. Admin sessions use signed HMAC tokens stored in `HttpOnly, SameSite=Strict` cookies. Passwords are never returned in user payloads. |
| **SSRF Protection** | Outbound requests are filtered via `isSafeOutboundUrl()`, blocking requests to loopback (`127.0.0.1`), private RFC1918 subnets, and cloud metadata services (`169.254.169.254`). |
| **Security Misconfiguration** | Removed internal database branch IDs, raw connection strings, debug ports, and verbose error messages from all user-facing interfaces and status endpoints. |
| **Logging & Monitoring** | `logSecurityAudit()` records administrative actions, device provisioning, failed login attempts, and incident resolutions with severity levels. |

---

## Project Structure

```
promove/
├── android/                    # Native Android (Kotlin + Jetpack Compose) project
├── ios/                        # Native iOS (Swift + SwiftUI) project
├── docker/
│   ├── docker-compose.yml      # Local Postgres 16 & Redis 7 services
│   └── init-db.sql             # Relational database schema with RLS & partitions
├── docs/                       # Architecture, roadmap, and SEO documentation
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Fleet operational views (dashboard, vehicles, drivers,
│   │   │                       # live-map, ledger, incidents, reports, settings)
│   │   ├── admin/              # Central Platform Administration Portal
│   │   ├── api/
│   │   │   ├── admin/          # Admin APIs (auth, users, vehicles, assign-gps, incidents, reports)
│   │   │   ├── gps/            # Telematics APIs (positions, telemetry, traccar-webhook)
│   │   │   ├── payments/       # Hubtel payment webhook & status check
│   │   │   ├── onboarding/     # New fleet onboarding API
│   │   │   └── health/         # System health check API
│   │   ├── driver-app/         # Mobile PWA optimized for in-vehicle drivers
│   │   ├── onboarding/         # Interactive fleet onboarding flow
│   │   ├── sign-in/ & sign-up/ # Clerk authentication pages
│   │   └── globals.css         # ProMove design tokens & theme variables
│   ├── components/             # Reusable UI components, modals, and Leaflet tracking map
│   ├── lib/
│   │   ├── admin-auth.ts       # HMAC session signer & constant-time password validator
│   │   ├── db.ts               # Neon Lakebase Postgres client & parameterized query runner
│   │   ├── fleet-context.tsx   # Fleet state management with multi-tenant isolation
│   │   ├── gps/                # Traccar adapter, telemetry hub, and corridor coordinates
│   │   ├── security.ts         # Input sanitizers, SSRF guard, and security audit logger
│   │   ├── storage.ts          # S3-compatible document storage provider
│   │   └── types.ts            # Core TypeScript domain entities & money types
│   └── proxy.ts                # Next.js 16 security proxy & deny-by-default access controller
├── tests/                      # Automated test suites (tenancy, money, GPS, admin security)
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 20 or newer
- **npm**: Version 10 or newer
- **Git**

### Environment Configuration
Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding

# Neon Lakebase Postgres Database
DATABASE_URL="postgresql://user:pass@ep-hostname-pooler.region.neon.tech/neondb?sslmode=require"

# Platform Administration Credentials (Strict Server-Side Auth)
ADMIN_EMAIL="admin@promovegh.com,admin@promove.com,heisreincarnated@gmail.com"
ADMIN_PASSWORD="ProMove@Admin2026!"
ADMIN_SESSION_SECRET="promove_enterprise_admin_sec_2026_x89a"

# Neon Object Storage (S3-Compatible)
NEON_STORAGE_ENDPOINT="https://storage.region.neon.tech"
NEON_STORAGE_REGION="us-east-2"
NEON_STORAGE_BUCKET="documents"
NEON_STORAGE_ACCESS_KEY_ID="nak_live_..."
NEON_STORAGE_SECRET_ACCESS_KEY="nsk_live_..."
```

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts & Automated Testing

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js Turbopack development server on port 3000 |
| `npm run build` | Compiles an optimized production build and validates route types |
| `npm run start` | Starts the production server |
| `npm test` | Runs all 20 automated domain and security test suites |
| `npm run security:sast` | Runs static application security testing (`tsc --noEmit`) |
| `npm run security:dast` | Runs dynamic security tests (tamper detection, SSRF, timing safety) |
| `npm run security:check` | Unified security check pipeline (SAST + DAST) |

### Test Suites Covered
- **Admin Security:** Constant-time password verification, HMAC session signing, tamper resistance, and timing safety.
- **Input Sanitization & SSRF:** XSS stripping, IMEI validation, and private/metadata IP blocking.
- **Multi-Tenancy Isolation:** Verifies Organization A cannot query Organization B data.
- **Append-Only Ledger:** Confirms reversing entries, pesewa precision, and idempotency keys.
- **GPS Telematics:** State machine transitions (`moving`, `idle`, `parked`), geofence boundaries, and packet ingestion.
- **Statutory Consent:** Verification of Ghana Act 843 compliance prior to SMS/MoMo triggers.

---

## API Reference

### Administrative Routes (Protected by `pm_admin_session` HMAC Cookie)
- `POST /api/admin/auth/login`: Authenticates administrator against server credentials and sets secure cookie.
- `GET /api/admin/auth/session`: Verifies current administrator HMAC session.
- `POST /api/admin/auth/logout`: Clears administrator session cookie.
- `GET /api/admin/users`: Lists platform users with vehicle counts (passwords filtered).
- `GET /api/admin/vehicles`: Returns all platform vehicles with owner, driver, and live GPS position.
- `POST /api/admin/assign-gps`: Assigns GPS device IMEI and configuration on behalf of a user.
- `POST /api/admin/create-vehicle`: Creates a vehicle for a user needing assistance.
- `GET /api/admin/incidents` & `PATCH /api/admin/incidents`: Retrieves and resolves platform incidents.
- `GET /api/admin/reports`: Returns aggregated fleet distance, fuel economy, and traffic metrics.
- `POST /api/admin/set-role`: Permanently locked down (`403 Forbidden`).

### Telematics & GPS Routes
- `GET /api/gps/positions`: Returns live vehicle positions or streams Server-Sent Events (`?stream=true`).
- `POST /api/gps/telemetry`: Ingests in-app driver GPS pings from mobile senders.
- `POST /api/gps/traccar-webhook`: Ingests telemetry forwarded from Traccar Server (port 5055).
- `GET /api/gps/traccar-webhook`: Ingests OsmAnd protocol pings (`?id=IMEI&lat=...&lon=...`).

### Operational & Payment Routes
- `POST /api/onboarding`: Registers new fleet organization and initial vehicles.
- `POST /api/payments/callback`: Webhook receiver for Hubtel Mobile Money payment confirmations.
- `POST /api/payments/status-check`: Queries Hubtel transaction settlement status.
- `GET /api/health`: Application health check and uptime probe.
- `GET /api/system-status`: Sanitized infrastructure readiness probe.

---

## Platform Administrator Credentials

For authorized administration access via `/admin`:

- **Admin Portal URL:** `http://localhost:3000/admin` (or deployed domain `/admin`)
- **Authorized Emails:** `admin@promovegh.com`, `admin@promove.com`, `heisreincarnated@gmail.com`
- **Master Password:** Configured in `ADMIN_PASSWORD` (default: `ProMove@Admin2026!`)

---

## License

Proprietary • Copyright © 2026 ProMove Ghana. All rights reserved.
