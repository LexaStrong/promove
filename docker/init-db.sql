-- ProMove Fleet Management Database Schema
-- Multi-tenant schema with PostgreSQL Row Level Security (RLS)
-- Amounts stored in integer pesewas (1 GHS = 100 pesewas)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organisations (Tenants)
CREATE TABLE organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'GHS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('owner', 'manager', 'driver', 'viewer', 'platform_admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    totp_secret VARCHAR(64),
    totp_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    plate_number VARCHAR(32) NOT NULL,
    make VARCHAR(64) NOT NULL,
    model VARCHAR(64) NOT NULL,
    year INT NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL CHECK (vehicle_type IN ('trotro', 'taxi', 'hauling', 'bus', 'delivery')),
    seats INT NOT NULL,
    fuel_type VARCHAR(16) NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
    current_odometer_km INT NOT NULL DEFAULT 0,
    gps_tracker_imei VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle', 'maintenance', 'unavailable')),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_org_plate UNIQUE (org_id, plate_number)
);

-- 4. Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role_type VARCHAR(32) NOT NULL DEFAULT 'driver' CHECK (role_type IN ('driver', 'conductor')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    licence_number_encrypted TEXT,
    licence_expiry DATE,
    sms_consent_given BOOLEAN DEFAULT FALSE,
    location_consent_given BOOLEAN DEFAULT FALSE,
    consent_recorded_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'left')),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vehicle Assignments (History Preserved)
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    commission_type VARCHAR(32) NOT NULL CHECK (commission_type IN ('percentage', 'fixed_daily', 'none')),
    commission_value INT NOT NULL DEFAULT 0,
    daily_target_pesewas BIGINT NOT NULL DEFAULT 0,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Append-Only Financial Ledger (Never Delete, Void With Reversal)
CREATE TABLE ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    entry_type VARCHAR(32) NOT NULL CHECK (entry_type IN ('income', 'expense', 'commission', 'remittance', 'adjustment')),
    category VARCHAR(64) NOT NULL,
    amount_pesewas BIGINT NOT NULL,
    payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('cash', 'momo_manual', 'momo_hubtel', 'bank_transfer')),
    recorded_by UUID REFERENCES users(id),
    idempotency_key VARCHAR(128) UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'voided')),
    void_reason TEXT,
    void_reversal_id UUID REFERENCES ledger(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Fuel Logs
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    ledger_entry_id UUID REFERENCES ledger(id),
    fuel_type VARCHAR(16) NOT NULL,
    litres NUMERIC(8,2) NOT NULL,
    amount_pesewas BIGINT NOT NULL,
    odometer_km INT NOT NULL,
    station_name VARCHAR(128),
    receipt_url TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vehicle Documents
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    doc_type VARCHAR(32) NOT NULL CHECK (doc_type IN ('insurance', 'roadworthy', 'registration', 'permit')),
    document_number VARCHAR(128) NOT NULL,
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Maintenance Schedules and Records
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(128) NOT NULL,
    interval_km INT,
    interval_days INT,
    last_service_km INT,
    last_service_date DATE,
    next_due_km INT,
    next_due_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'up_to_date' CHECK (status IN ('up_to_date', 'due_soon', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    ledger_entry_id UUID REFERENCES ledger(id),
    service_type VARCHAR(128) NOT NULL,
    workshop_name VARCHAR(128) NOT NULL,
    cost_pesewas BIGINT NOT NULL DEFAULT 0,
    odometer_km INT NOT NULL,
    invoice_url TEXT,
    notes TEXT,
    completed_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Incidents and Faults
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    incident_type VARCHAR(32) NOT NULL CHECK (incident_type IN ('breakdown', 'accident', 'delay', 'theft', 'other')),
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution_notes TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    route_label VARCHAR(128) NOT NULL,
    start_odometer_km INT NOT NULL,
    end_odometer_km INT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Mobile Money Payments (Hubtel)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    amount_pesewas BIGINT NOT NULL,
    customer_msisdn VARCHAR(20) NOT NULL,
    client_reference VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'pending', 'paid', 'failed', 'expired')),
    hubtel_transaction_id VARCHAR(64),
    raw_callback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Enable PostgreSQL Row Level Security (RLS) on Business Tables
-- ─────────────────────────────────────────────────────────────

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY vehicles_tenant_policy ON vehicles
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY drivers_tenant_policy ON drivers
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY assignments_tenant_policy ON vehicle_assignments
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY ledger_tenant_policy ON ledger
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY fuel_logs_tenant_policy ON fuel_logs
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY documents_tenant_policy ON vehicle_documents
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY maintenance_schedules_tenant_policy ON maintenance_schedules
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY maintenance_records_tenant_policy ON maintenance_records
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY incidents_tenant_policy ON incidents
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY trips_tenant_policy ON trips
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY audit_logs_tenant_policy ON audit_logs
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY payments_tenant_policy ON payments
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

-- 14. GPS Telematics Positions (Monthly Partitioned)
CREATE TABLE positions (
    id UUID DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL DEFAULT 0,
    course_heading INT DEFAULT 0,
    ignition BOOLEAN DEFAULT FALSE,
    battery_percentage INT,
    recorded_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Monthly partition tables
CREATE TABLE positions_2026_09 PARTITION OF positions
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE positions_2026_10 PARTITION OF positions
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY positions_tenant_policy ON positions
    USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

