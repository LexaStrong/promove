# ProMove • Intelligent Fleet Operations & Telematics Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Clerk SSO](https://img.shields.io/badge/Clerk-Identity%20Engine-6C47FF?style=flat&logo=clerk)](https://clerk.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Lakebase%20Postgres-00E599?style=flat&logo=postgresql)](https://neon.tech/)
[![Ghana Act 843](https://img.shields.io/badge/Compliance-Ghana%20Act%20843-006B3F?style=flat)](https://dataprotection.org.gh/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=flat)]()

**ProMove** is an enterprise-grade, mobile-first commercial fleet operating system and telematics platform engineered specifically for the commercial transport landscape in Ghana and West Africa. It replaces informal paper logbooks, unmonitored cash handoffs, and fragmented WhatsApp chats with an integrated, auditable digital backbone.

Built for commercial minibuses (**trotros**), shared and ride-hailing **taxis**, **intercity coaches**, and heavy logistics/tipper **hauling fleets**, ProMove unifies vehicle registries, driver management, real-time GPS hardware telematics, append-only financial accounting, statutory DVLA compliance, and dedicated platform administration into a single high-performance workspace.

---

## Table of Contents

- [What ProMove Solves](#what-promove-solves)
- [Key Features & Capabilities](#key-features--capabilities)
  - [1. Real-Time Telematics & GPS Hardware Gateway](#1-real-time-telematics--gps-hardware-gateway)
  - [2. Multi-Tenant Fleet Operations](#2-multi-tenant-fleet-operations)
  - [3. Dual-Mode Authentication with Clerk SSO & Local Fallback](#3-dual-mode-authentication-with-clerk-sso--local-fallback)
  - [4. Financial Ledger & Mobile Money (MoMo)](#4-financial-ledger--mobile-money-momo)
  - [5. Dedicated Platform Administration Portal (`/admin`)](#5-dedicated-platform-administration-portal-admin)
  - [6. Statutory DVLA Compliance & Ghana Act 843 Data Protection](#6-statutory-dvla-compliance--ghana-act-843-data-protection)
  - [7. Multi-Platform Support (Web, Android & iOS)](#7-multi-platform-support-web-android--ios)
- [System Architecture](#system-architecture)
- [Security & Core Mitigation Model](#security--core-mitigation-model)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration (`.env.local`)](#environment-configuration-envlocal)
  - [Database Migration](#database-migration)
  - [Running Locally](#running-locally)
- [Automated Testing & Security Audits](#automated-testing--security-audits)
- [Complete API Reference](#complete-api-reference)
- [Platform Administration Credentials](#platform-administration-credentials)
- [License](#license)

---

## What ProMove Solves

In the Ghanaian commercial transport ecosystem, vehicle owners face four major hurdles that erode profitability and asset longevity:

1. **Daily Revenue Leakage & Reconciliation Disputes:** Disagreements between vehicle owners and drivers over daily sales targets ("sales"), fuel receipts, and unaccounted deductions.
2. **Blind Transit Operations:** Fleet owners have no real-time visibility into vehicle coordinates, speeding violations, unauthorised detours, or abnormal engine idling along major transit arteries.
3. **Statutory Penalties & Lapsed Renewals:** Roadworthiness inspection expiries, insurance renewals, and driver licensing deadlines frequently lapse without warning, causing impoundments and police fines.
4. **Floating-Point Financial Drift:** Off-the-shelf software storing currency amounts as floating-point decimals introduces subtle rounding errors that compound over hundreds of daily transactions.

**ProMove resolves these challenges through:**
- **Exact Integer Pesewa Accounting:** All financial entries are stored as integers (1 GHS = 100 pesewas) with an append-only ledger and immutable audit trails.
- **Hardware-Agnostic GPS Ingestion:** High-frequency telemetry ingestion from physical GPS hardware (GT06, Concox, TK103, Teltonika FMB920) and mobile OsmAnd protocol senders.
- **Corridor Geofencing & Safety Alerts:** Automated terminal arrival detection (Circle Neoplan, Kaneshie, Madina Zongo Junction, Tema Community 1) and instantaneous speed alerts (>80 km/h).
- **Proactive DVLA Expiry Queues:** 30-day, 14-day, and 7-day automated warning notifications before insurance or roadworthiness expires.

---

## Key Features & Capabilities

### 1. Real-Time Telematics & GPS Hardware Gateway
- **Interactive Fleet Radar Map:** Built with Leaflet, featuring satellite and street base maps, real-time vehicle heading rotation, speed badges, and live breadcrumb trail history.
- **Traccar & OsmAnd Ingestion Gateway (`/api/gps/traccar-webhook`):** Accepts standard telemetry forwarded from Traccar Server (port 5055) or direct HTTP GET/POST OsmAnd packets (`?id=IMEI&lat=...&lon=...`).
- **Live Positions API (`/api/gps/positions`):** Delivers snapshot vehicle locations or high-efficiency Server-Sent Events (SSE) streaming updates (`?stream=true`).
- **Vehicle State Machine:** Real-time state transitions between `moving`, `idle`, `parked`, `offline`, and `maintenance`.

### 2. Multi-Tenant Fleet Operations
- **Isolated Organization Workspaces:** Strict tenant isolation guarantees that an organization's records (vehicles, drivers, financial entries, maintenance schedules) can never be accessed by another tenant.
- **Curated Ghanaian Vehicle Registry:** Built-in specs for common commercial vehicles:
  - **Trotro:** Toyota Hiace (15-seater), Nissan Urvan (15-seater), Mercedes-Benz Sprinter (23-32 seater).
  - **Taxi / Saloon:** Hyundai Elantra, Kia Morning, Toyota Vitz, Daewoo Matiz.
  - **Haulage & Tipper:** Mack Tipper, Sinotruk Howo, MAN Diesel Tipper.
  - **Intercity Coach:** Yutong Coach, Scania Marcopolo.
  - **Delivery Van:** Hyundai H-100, Kia K2700.
- **Driver Profiles & Assignments:** Driver licensing class verification, safety scoring, emergency contacts, and dual assignment models (Fixed Daily Target vs. Percentage Commission).

### 3. Dual-Mode Authentication with Clerk SSO & Local Fallback
- **Clerk Identity Engine:** Backed by Clerk SSO for Google OAuth, Apple ID, and secure SMS/email verification.
- **Seamless Local Operator Fallback:** Operates with zero downtime even when offline or before Clerk keys are configured. Unauthenticated operators can initialize, onboard vehicles, and access the dashboard in local workspace mode without being trapped in redirect loops.
- **`login-02` & `signup-02`:** State-of-the-art shadcn split-screen authentication interfaces with responsive visual hero panels, telematics badges, and statutory trust footers.
- **SSO Callback Handler (`/sso-callback`):** Dedicated Next.js App Router handler for seamless Clerk third-party authentication handoffs.

### 4. Financial Ledger & Mobile Money (MoMo)
- **Integer Pesewa Precision:** Zero floating-point math across income, expenses, and driver commissions.
- **Append-Only Ledger:** Transactions are never deleted; adjustments generate reversing offsetting entries (`is_void_reversal`) with mandatory audit reasons.
- **Hubtel Mobile Money Integration:** Webhook endpoints (`/api/payments/callback`) and status probes (`/api/payments/status-check`) supporting automated collections across MTN Mobile Money, Telecel Cash, and AT Money.

### 5. Dedicated Platform Administration Portal (`/admin`)
- **HMAC-SHA256 Cryptographic Authentication:** Master admin access requiring verified credentials and issuing an `HttpOnly, SameSite=Strict` tamper-evident token (`pm_admin_session`).
- **Platform Supervision:** Real-time oversight of all platform users, organizations, vehicles, and active GPS streams nationwide.
- **Assisted User Setup:** Administrators can register vehicles and provision hardware GPS device IMEIs on behalf of operators who need onboarding support.
- **Corridor Safety Incidents:** Triage overspeed events, geofence breaches, and route violations with interactive resolution notes.

### 6. Statutory DVLA Compliance & Ghana Act 843 Data Protection
- **Ghana Data Protection Act (Act 843):** Explicit driver consent is verified and timestamped before location tracking or automated SMS dispatches.
- **Encrypted Document Vault:** Secure storage for roadworthiness stickers, insurance policies, and driver licenses via S3-compatible object storage with presigned temporary URLs.

### 7. Multi-Platform Support (Web, Android & iOS)
- **Web App & Driver PWA (`/driver-app`):** Responsive desktop and mobile application with bottom navigation bar and offline synchronization queue.
- **Native Android Blueprint (`android/`):** Kotlin, Jetpack Compose, Retrofit, Coroutines, Material 3, and background GPS location services.
- **Native iOS Blueprint (`ios/`):** Swift, SwiftUI, URLSession, and CoreLocation.

---

## System Architecture

```
                      ┌──────────────────────────────────────┐
                      │   Client Layer (Web / iOS / Android) │
                      │  • Next.js 16 App Router (PWA)       │
                      │  • Native Kotlin Jetpack Compose     │
                      │  • Native Swift SwiftUI              │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / WSS
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Next.js 16 Proxy / Middleware      │
                      │  • Public Route Gatekeeper           │
                      │  • HMAC Admin Session Validator      │
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

ProMove adheres to rigorous defensive engineering standards aligned with OWASP Top 10 guidelines:

| Threat Category | Defensive Implementation |
| :--- | :--- |
| **Broken Access Control** | Next.js 16 `src/proxy.ts` enforces deny-by-default routing. `/api/admin/*` endpoints strictly require a verified HMAC token. Critical role-escalation endpoints (`/api/admin/set-role`) are permanently disabled with a `403 Forbidden` response. |
| **Injection Flaws** | All database queries in `@/lib/db.ts` use parameterized placeholders (`$1, $2, ...`). Inputs are sanitized using `sanitizePlainText()`, `sanitizePlateNumber()`, and coordinate validators in `@/lib/security.ts`. |
| **Authentication Failures** | Constant-time password verification (`crypto.timingSafeEqual`) prevents side-channel timing analysis. Admin sessions use signed HMAC tokens stored in `HttpOnly, SameSite=Strict` cookies. Passwords are never returned in user payloads. |
| **SSRF Protection** | Outbound requests are validated via `isSafeOutboundUrl()`, blocking requests to loopback (`127.0.0.1`), private RFC1918 subnets, and cloud metadata services (`169.254.169.254`). |
| **Information Leakage** | Internal database branch IDs, raw connection strings, debug ports, and verbose error messages are strictly stripped from all public interfaces and status endpoints. |
| **Tamper Auditing** | `logSecurityAudit()` records administrative actions, device provisioning, failed login attempts, and incident resolutions with severity levels. |

---

## Project Directory Structure

```
promove/
├── android/                    # Native Android (Kotlin + Jetpack Compose) project
├── ios/                        # Native iOS (Swift + SwiftUI) project
├── docker/
│   ├── docker-compose.yml      # Local Postgres 16 & Redis 7 services
│   └── init-db.sql             # Relational database schema with RLS & partitions
├── docs/                       # Architecture, roadmap, and SEO documentation
├── public/                     # Static assets (logos, splash imagery, icons, llms.txt)
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
│   │   ├── onboarding/         # Dual-mode fleet onboarding setup
│   │   ├── login/ & signup/    # shadcn login-02 & signup-02 pages
│   │   ├── sign-in/ & sign-up/ # Clerk authentication route redirects
│   │   ├── sso-callback/       # Clerk OAuth callback handler
│   │   └── globals.css         # ProMove design tokens & theme variables
│   ├── components/             # Reusable UI components, modals, and Leaflet tracking map
│   │   └── ui/                 # shadcn UI components (button, card, input, label)
│   ├── lib/
│   │   ├── admin-auth.ts       # HMAC session signer & constant-time password validator
│   │   ├── auth-context.tsx    # Dual-mode Clerk + Local Auth provider
│   │   ├── db.ts               # Neon Lakebase Postgres client & parameterized query runner
│   │   ├── fleet-context.tsx   # Fleet state management with multi-tenant isolation
│   │   ├── fleet-storage.ts    # Per-user scoped browser storage
│   │   ├── gps/                # Traccar adapter, telemetry hub, and corridor coordinates
│   │   ├── security.ts         # Input sanitizers, SSRF guard, and security audit logger
│   │   ├── storage.ts          # S3-compatible document storage provider
│   │   ├── vehicle-catalog.ts  # Curated Ghanaian commercial vehicle catalog
│   │   └── types.ts            # Core TypeScript domain entities & money types
│   └── proxy.ts                # Next.js 16 security proxy & route gatekeeper
├── tests/                      # Automated test suites (31 passing tests)
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 20 or newer
- **npm**: Version 10 or newer
- **Git**

### Environment Configuration (`.env.local`)
Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding

# Neon Lakebase Postgres Database
DATABASE_URL="postgresql://user:pass@ep-hostname-pooler.region.neon.tech/neondb?sslmode=require"

# Platform Administration (Clerk-Backed Identity)
ADMIN_EMAIL="admin@promovegh.com,admin@promove.com,heisreincarnated@gmail.com"
ADMIN_SESSION_SECRET="your_cryptographic_admin_session_secret_min_32_chars"

# Neon Object Storage (S3-Compatible)
NEON_STORAGE_ENDPOINT="https://storage.region.neon.tech"
NEON_STORAGE_REGION="us-east-2"
NEON_STORAGE_BUCKET="documents"
NEON_STORAGE_ACCESS_KEY_ID="nak_live_..."
NEON_STORAGE_SECRET_ACCESS_KEY="nsk_live_..."

# Hubtel Payment Gateway (Sandbox or Live)
HUBTEL_CLIENT_ID="your_hubtel_client_id"
HUBTEL_CLIENT_SECRET="your_hubtel_client_secret"
HUBTEL_MERCHANT_ACCOUNT_NUMBER="your_hubtel_account_number"
```

### Database Migration
Apply the database schema and Row Level Security policies to your Neon Postgres database:

```bash
npm run db:migrate
```

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server with Turbopack:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing & Security Audits

ProMove includes 31 automated tests covering multi-tenancy, append-only accounting, GPS tracking, and cryptographic admin security:

```bash
# Run all automated unit and integration tests
npm test

# Run static application security testing (Typecheck)
npm run security:sast

# Run dynamic security testing (SSRF, timing attacks, HMAC tamper detection)
npm run security:dast

# Run full unified security audit
npm run security:check
```

### Verified Test Suites (31 / 31 Passing)
- **Admin Security:** Constant-time password verification, HMAC session signing, tamper resistance, and timing safety.
- **Input Sanitization & SSRF:** XSS stripping, IMEI validation, and private/metadata IP blocking.
- **Multi-Tenancy Isolation:** Verifies Organization A cannot query Organization B data across vehicles and financial ledgers.
- **Append-Only Ledger:** Confirms reversing entries, pesewa precision, and idempotency keys.
- **GPS Telematics:** State machine transitions (`moving`, `idle`, `parked`), geofence boundaries, and packet ingestion.
- **Statutory Consent:** Verification of Ghana Act 843 compliance prior to SMS/MoMo triggers.
- **Theme Persistence:** Cross-session SSR cookie and localStorage theme hydration.

---

## Complete API Reference

### Administrative Routes (Protected by `pm_admin_session` HMAC Cookie)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/auth/login` | Authenticates administrator against credentials and sets secure cookie. |
| `GET` | `/api/admin/auth/session` | Verifies active administrator HMAC session. |
| `POST` | `/api/admin/auth/logout` | Clears administrator session cookie. |
| `GET` | `/api/admin/users` | Lists platform users with organization and vehicle counts. |
| `GET` | `/api/admin/vehicles` | Returns all platform vehicles with owner, driver, and live GPS position. |
| `POST` | `/api/admin/assign-gps` | Provisions GPS device IMEI and protocol on behalf of an operator. |
| `POST` | `/api/admin/create-vehicle` | Creates a vehicle on behalf of an operator needing onboarding support. |
| `GET` | `/api/admin/incidents` | Retrieves platform incidents (overspeed, geofence breaches). |
| `PATCH` | `/api/admin/incidents` | Resolves an open incident with resolution notes. |
| `GET` | `/api/admin/reports` | Returns aggregated fleet distance, fuel economy, and traffic metrics. |
| `POST` | `/api/admin/set-role` | Permanently disabled (`403 Forbidden`). |

### Telematics & GPS Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/gps/positions` | Returns live vehicle positions or streams Server-Sent Events (`?stream=true`). |
| `POST` | `/api/gps/telemetry` | Ingests in-app driver GPS pings from mobile senders. |
| `POST` | `/api/gps/traccar-webhook` | Ingests telemetry forwarded from Traccar Server (port 5055). |
| `GET` | `/api/gps/traccar-webhook` | Ingests OsmAnd protocol pings (`?id=IMEI&lat=...&lon=...`). |

### Operational & Payment Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/onboarding` | Registers new fleet organization and initial vehicles. |
| `GET` | `/api/fleet/vehicles` | Returns tenant vehicles with driver assignments. |
| `POST` | `/api/fleet/vehicles` | Creates a new tenant vehicle with DVLA validation. |
| `GET` | `/api/fleet/ledger` | Returns append-only daily ledger entries. |
| `POST` | `/api/fleet/ledger` | Records daily sales, fuel, or reversal entry with exact pesewas. |
| `POST` | `/api/fleet/sync` | Processes offline driver sync queue idempotently. |
| `POST` | `/api/payments/callback` | Webhook receiver for Hubtel Mobile Money payment confirmations. |
| `POST` | `/api/payments/status-check` | Queries Hubtel transaction settlement status. |
| `GET` | `/api/health` | Application health check and uptime probe. |
| `GET` | `/api/system-status` | Sanitized infrastructure readiness probe. |

---

## Platform Administration Credentials

To access the Central Platform Administration Portal:

- **Admin Portal URL:** `http://localhost:3000/admin` (or deployed domain `/admin`)
- **Authentication:** Authenticates against administrator email configured in `ADMIN_EMAIL` via **Clerk SSO Credentials**.
- **Cryptographic Security:** Zero static passwords; managed via Clerk Identity Engine with tamper-evident HMAC-SHA256 session token generation.

---

## License

Proprietary • Copyright © 2026 ProMove Ghana. All rights reserved.
