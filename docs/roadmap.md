# Product and Engineering Roadmap

This roadmap reflects the code in this repository, not a claim that planned items are already production-ready. Sequence work by dependency: identity and tenant-safe persistence precede real money, location, and document data.

## P0: Safe production foundation

### Server-side identity and authorization

- Replace the in-memory demo `AuthProvider` with server-validated credentials or a managed identity provider, secure sessions, password reset, and real TOTP verification.
- Define server-side role and organization authorization for every page action and API. Never trust a client-selected role or `org_id`.
- Acceptance: unauthenticated and cross-tenant requests are denied in integration tests; logout invalidates the session; MFA cannot be bypassed by omitting a code.

### Tenant-scoped persistence

- Add a typed database access layer and migrations. Use transactions and derive tenant context from the authenticated session before setting PostgreSQL RLS context.
- Replace mock-data writes with repositories for vehicles, drivers, assignments, trips, ledger, maintenance, incidents, and documents.
- Acceptance: two-organization tests prove isolation at API and database layers; financial mutations are atomic and recorded in an append-only audit trail.

### Honest service and payment boundaries

- Replace the constant `/api/health` claims with actual dependency checks and readiness/liveness semantics.
- Implement Hubtel callback signature verification, replay protection, idempotent persistence, safe redaction, and reconciliation before enabling live collections. Remove process-memory callback logs and fabricated settlement IDs.
- Acceptance: health reports degrade when dependencies fail; callback tests cover bad signatures, retries, duplicate references, and mismatched amounts.

### Secrets and deployment security

- Remove development credentials from shared/prod compose configuration; load secrets from deployment configuration and bind local-only ports to loopback where appropriate.
- Add security headers, request-size limits, rate limits for auth/payment endpoints, structured redacted logs, backup restore tests, and a documented retention policy for GPS and personal data.
- Acceptance: a production checklist passes with no demo credentials, no mock services enabled, and tested restore procedures.

## P1: Pilot-ready operations

### Core fleet and finance workflows

- Complete CRUD and lifecycle rules for vehicle/driver registries, assignment history, trips, and daily ledger.
- Keep money in integer pesewas, enforce idempotency for retries, and make voids produce auditable reversals instead of deletes.
- Acceptance: owner/manager/driver/viewer permission matrix is tested; ledger totals reconcile per vehicle, driver, and organization.

### Driver offline synchronization

- Persist the offline queue in IndexedDB, attach stable idempotency keys, expose sync state, and define conflict/retry policy.
- Acceptance: airplane-mode entry creation survives reload and syncs once after reconnect; rejected entries remain actionable to the driver.

### GPS and safety events

- Connect a server-side Traccar adapter, authenticate webhooks/polling, map device IDs to tenant vehicles, reject out-of-order positions, and calculate stale/offline thresholds.
- Acceptance: only authorized tenant vehicles appear; stale data is labelled; GPS outage does not make the rest of the app unusable.

### Documents, maintenance, and incidents

- Connect private object storage with size/type validation, malware scanning, signed downloads, tenant-specific keys, and expiry tracking.
- Link maintenance/incident costs to ledger entries and define notification consent and delivery status.
- Acceptance: access to another tenant's file is denied; document expiry and incident lifecycle tests cover boundaries.

## P2: Operational completeness

- Add reliable weekly/monthly reports and audited CSV/PDF exports.
- Add observability for queue lag, GPS freshness, webhook processing, failed notifications, and database health.
- Improve admin workflows for platform-managed bulk fleet imports, review, and owner read-only access where required.
- Add backup retention, restore drills, support runbooks, and staged release/rollback procedures.

## P3: Acquisition and scale

- Expand public SEO beyond the homepage/privacy policy with accurate product pages, Ghana-specific use cases, implementation details, and FAQs.
- Publish real case studies and testimonials only with customer approval; do not fabricate ratings, outcomes, pricing, or structured-data claims.
- Add onboarding analytics with consent, conversion measurement, and page performance monitoring.
- Revisit partition retention, caching, and service decomposition only when measured usage justifies it.

## Release gates

Do not launch with real customer data until P0 is complete, an independent tenant-isolation/security review passes, data restoration is exercised, payment callbacks are proven idempotent, and privacy/consent claims match implemented behavior. The current demo build is appropriate for internal review and product validation only.
