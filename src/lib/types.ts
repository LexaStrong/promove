// ─────────────────────────────────────────────
// ProMove Types: Matches the data model exactly
// Money: integer pesewas (bigint in DB, number in TS)
// IDs: UUID strings
// ─────────────────────────────────────────────

export type OrgStatus = 'active' | 'suspended';
export type Role = 'owner' | 'manager' | 'driver' | 'viewer' | 'platform_admin';
export type VehicleType = 'trotro' | 'taxi' | 'bus' | 'truck' | 'pickup' | 'other';
export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'unavailable';
export type FuelType = 'petrol' | 'diesel' | 'lpg' | 'electric';
export type DriverRoleType = 'driver' | 'conductor';
export type DriverStatus = 'active' | 'suspended' | 'left';
export type CommissionType = 'percent' | 'fixed' | 'none';
export type EntryType = 'income' | 'expense' | 'commission' | 'remittance' | 'adjustment';
export type LedgerCategory = 'daily_sales' | 'fuel' | 'repair' | 'parts' | 'insurance' | 'fine' | 'salary' | 'other';
export type PaymentMethod = 'cash' | 'momo_manual' | 'momo_hubtel';
export type LedgerStatus = 'confirmed' | 'voided';
export type DocType = 'insurance' | 'roadworthy' | 'registration' | 'permit' | 'other';
export type IncidentType = 'breakdown' | 'accident' | 'delay' | 'theft' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';
export type TripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type NotifChannel = 'in_app' | 'sms';
export type NotifType = 'doc_expiry' | 'maintenance_due' | 'incident' | 'assignment' | 'report_ready';
export type NotifStatus = 'queued' | 'sent' | 'failed' | 'read';
export type SyncStatus = 'synced' | 'pending' | 'failed';

// ── Core Entities ─────────────────────────────

export interface Organization {
  id: string;
  name: string;
  phone: string;
  region: string;
  currency: string;
  timezone: string;
  status: OrgStatus;
  created_at: string;
}

export interface User {
  id: string;
  email: string | null;
  phone: string;
  full_name: string;
  is_platform_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: Role;
  user?: User;
}

export interface Vehicle {
  id: string;
  org_id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: VehicleType;
  colour: string | null;
  vin: string | null;
  seats: number | null;
  fuel_type: FuelType;
  status: VehicleStatus;
  odometer_km: number;
  daily_target_pesewas: number | null;
  gps_device_id: string | null;
  archived_at: string | null;
  created_at: string;
  // Joined data
  current_driver?: Driver;
  assignment?: VehicleAssignment;
}

export interface Driver {
  id: string;
  org_id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  role_type: DriverRoleType;
  licence_number_enc: string | null;
  licence_class: string | null;
  licence_expiry: string | null;
  status: DriverStatus;
  emergency_contact: string | null;
  sms_consent_given?: boolean;
  sms_consent_at?: string | null;
  location_consent_given?: boolean;
  location_consent_at?: string | null;
  archived_at: string | null;
  // Joined data
  current_vehicle?: Vehicle;
  assignment?: VehicleAssignment;
}

export interface VehicleAssignment {
  id: string;
  org_id: string;
  vehicle_id: string;
  driver_id: string;
  starts_at: string;
  ends_at: string | null;
  commission_type: CommissionType;
  commission_value: number;
  daily_sales_target_pesewas: number | null;
  // Joined
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface LedgerEntry {
  id: string;
  org_id: string;
  vehicle_id: string;
  driver_id: string | null;
  trip_id: string | null;
  entry_date: string;
  entry_type: EntryType;
  category: LedgerCategory;
  amount_pesewas: number;
  payment_method: PaymentMethod;
  reference: string | null;
  status: LedgerStatus;
  voided_by_entry_id: string | null;
  void_reason: string | null;
  recorded_by: string;
  idempotency_key: string;
  notes: string | null;
  created_at: string;
  // Joined
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface VehicleDocument {
  id: string;
  org_id: string;
  vehicle_id: string;
  doc_type: DocType;
  doc_number: string | null;
  issued_on: string | null;
  expires_on: string;
  file_url: string | null;
  // Computed
  days_until_expiry?: number;
  vehicle?: Vehicle;
}

export interface MaintenanceSchedule {
  id: string;
  org_id: string;
  vehicle_id: string;
  kind: string;
  interval_km: number | null;
  interval_days: number | null;
  last_done_on: string | null;
  last_done_km: number | null;
  next_due_on: string | null;
  next_due_km: number | null;
  vehicle?: Vehicle;
}

export interface MaintenanceRecord {
  id: string;
  org_id: string;
  vehicle_id: string;
  schedule_id: string | null;
  performed_on: string;
  odometer_km: number | null;
  workshop: string | null;
  description: string;
  cost_pesewas: number | null;
  ledger_entry_id: string | null;
  vehicle?: Vehicle;
}

export interface Incident {
  id: string;
  org_id: string;
  vehicle_id: string;
  driver_id: string | null;
  incident_type: IncidentType;
  severity: Severity;
  description: string;
  location_text: string | null;
  status: IncidentStatus;
  reported_by: string;
  reported_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface FuelLog {
  id: string;
  org_id: string;
  vehicle_id: string;
  driver_id: string | null;
  filled_on: string;
  litres: number;
  amount_pesewas: number;
  odometer_km: number | null;
  station: string | null;
  ledger_entry_id: string | null;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface Trip {
  id: string;
  org_id: string;
  vehicle_id: string;
  driver_id: string;
  route_label: string;
  started_at: string;
  ended_at: string | null;
  start_odometer_km: number | null;
  end_odometer_km: number | null;
  status: TripStatus;
  notes: string | null;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface Notification {
  id: string;
  org_id: string;
  recipient_user_id: string | null;
  recipient_driver_id: string | null;
  channel: NotifChannel;
  notif_type: NotifType;
  payload: Record<string, unknown>;
  status: NotifStatus;
  scheduled_for: string;
  sent_at: string | null;
  provider_ref: string | null;
  error: string | null;
}

export interface AuditLog {
  id: string;
  org_id: string | null;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor?: User;
}

// ── Dashboard ─────────────────────────────────

export interface FleetStats {
  total_vehicles: number;
  active: number;
  idle: number;
  maintenance: number;
  unavailable: number;
  total_drivers: number;
  active_drivers: number;
  today_income_pesewas: number;
  today_expenses_pesewas: number;
  this_week_income_pesewas: number;
  this_week_expenses_pesewas: number;
  this_month_income_pesewas: number;
  this_month_expenses_pesewas: number;
  docs_expiring_soon: number;
  maintenance_overdue: number;
  open_incidents: number;
}

export interface DailyTotal {
  date: string;
  income_pesewas: number;
  expense_pesewas: number;
}

// ── Helpers ───────────────────────────────────

export function formatPesewas(pesewas: number): string {
  const cedis = pesewas / 100;
  return `GH₵ ${cedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPesewasShort(pesewas: number): string {
  const cedis = pesewas / 100;
  if (cedis >= 1000) {
    return `GH₵ ${(cedis / 1000).toFixed(1)}k`;
  }
  return `GH₵ ${cedis.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function canPerform(
  action: 'manage_team' | 'record_ledger' | 'void_ledger' | 'delete_record' | 'edit_vehicle' | 'export_reports',
  role: Role
): boolean {
  switch (role) {
    case 'owner':
    case 'platform_admin':
      return true;
    case 'manager':
      return action !== 'manage_team' && action !== 'delete_record';
    case 'driver':
      return action === 'record_ledger';
    case 'viewer':
      return action === 'export_reports';
    default:
      return false;
  }
}
