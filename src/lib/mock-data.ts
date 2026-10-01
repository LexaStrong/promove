// ─────────────────────────────────────────────
// ProMove Mock Data — Realistic Ghana fleet data
// All money in pesewas (100 pesewas = GH₵ 1)
// ─────────────────────────────────────────────

import {
  Organization, User, OrgMember, Vehicle, Driver,
  VehicleAssignment, LedgerEntry, VehicleDocument,
  MaintenanceSchedule, MaintenanceRecord, Incident,
  FuelLog, Trip, Notification, AuditLog, FleetStats, DailyTotal,
} from './types';

// ── Organization ──────────────────────────────

export const mockOrg: Organization = {
  id: 'org-001',
  name: 'Twum Transport Services',
  phone: '+233244123456',
  region: 'Greater Accra',
  currency: 'GHS',
  timezone: 'Africa/Accra',
  status: 'active',
  created_at: '2025-03-15T10:00:00Z',
};

// ── Users ─────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'frank@twumtransport.com',
    phone: '+233244123456',
    full_name: 'Frank Twum',
    is_platform_admin: false,
    is_active: true,
    last_login_at: '2026-09-30T08:12:00Z',
  },
  {
    id: 'user-002',
    email: 'ama@twumtransport.com',
    phone: '+233244234567',
    full_name: 'Ama Mensah',
    is_platform_admin: false,
    is_active: true,
    last_login_at: '2026-09-30T07:45:00Z',
  },
  {
    id: 'user-003',
    email: null,
    phone: '+233244345678',
    full_name: 'Kwame Asante',
    is_platform_admin: false,
    is_active: true,
    last_login_at: '2026-09-29T18:30:00Z',
  },
  {
    id: 'user-004',
    email: null,
    phone: '+233244456789',
    full_name: 'Yaw Boateng',
    is_platform_admin: false,
    is_active: true,
    last_login_at: '2026-09-30T06:00:00Z',
  },
  {
    id: 'user-005',
    email: 'kofi@investor.com',
    phone: '+233244567890',
    full_name: 'Kofi Osei',
    is_platform_admin: false,
    is_active: true,
    last_login_at: '2026-09-28T12:00:00Z',
  },
];

export const mockCurrentUser = mockUsers[0];

// ── Org Members ───────────────────────────────

export const mockOrgMembers: OrgMember[] = [
  { org_id: 'org-001', user_id: 'user-001', role: 'owner', user: mockUsers[0] },
  { org_id: 'org-001', user_id: 'user-002', role: 'manager', user: mockUsers[1] },
  { org_id: 'org-001', user_id: 'user-003', role: 'driver', user: mockUsers[2] },
  { org_id: 'org-001', user_id: 'user-004', role: 'driver', user: mockUsers[3] },
  { org_id: 'org-001', user_id: 'user-005', role: 'viewer', user: mockUsers[4] },
];

// ── Vehicles ──────────────────────────────────

export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-001', org_id: 'org-001', plate_number: 'GR 2345-22',
    make: 'Toyota', model: 'HiAce', year: 2019, vehicle_type: 'trotro',
    colour: 'White', vin: null, seats: 15, fuel_type: 'diesel',
    status: 'active', odometer_km: 124500,
    daily_target_pesewas: 35000, gps_device_id: null,
    archived_at: null, created_at: '2025-03-16T10:00:00Z',
  },
  {
    id: 'veh-002', org_id: 'org-001', plate_number: 'GR 5678-21',
    make: 'Hyundai', model: 'H350', year: 2018, vehicle_type: 'trotro',
    colour: 'Blue', vin: null, seats: 18, fuel_type: 'diesel',
    status: 'active', odometer_km: 189200,
    daily_target_pesewas: 40000, gps_device_id: null,
    archived_at: null, created_at: '2025-03-16T10:05:00Z',
  },
  {
    id: 'veh-003', org_id: 'org-001', plate_number: 'GR 9012-20',
    make: 'Nissan', model: 'Urvan', year: 2017, vehicle_type: 'trotro',
    colour: 'Silver', vin: null, seats: 15, fuel_type: 'diesel',
    status: 'idle', odometer_km: 215300,
    daily_target_pesewas: 30000, gps_device_id: null,
    archived_at: null, created_at: '2025-04-01T08:00:00Z',
  },
  {
    id: 'veh-004', org_id: 'org-001', plate_number: 'GR 3456-23',
    make: 'Toyota', model: 'Corolla', year: 2021, vehicle_type: 'taxi',
    colour: 'Yellow', vin: null, seats: 4, fuel_type: 'petrol',
    status: 'active', odometer_km: 67800,
    daily_target_pesewas: 25000, gps_device_id: null,
    archived_at: null, created_at: '2025-05-10T09:00:00Z',
  },
  {
    id: 'veh-005', org_id: 'org-001', plate_number: 'GR 7890-22',
    make: 'Mercedes-Benz', model: 'Sprinter', year: 2020, vehicle_type: 'bus',
    colour: 'White', vin: null, seats: 22, fuel_type: 'diesel',
    status: 'maintenance', odometer_km: 156000,
    daily_target_pesewas: 50000, gps_device_id: null,
    archived_at: null, created_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'veh-006', org_id: 'org-001', plate_number: 'GR 1122-21',
    make: 'Kia', model: 'Bongo', year: 2018, vehicle_type: 'truck',
    colour: 'Red', vin: null, seats: 3, fuel_type: 'diesel',
    status: 'active', odometer_km: 198400,
    daily_target_pesewas: 45000, gps_device_id: null,
    archived_at: null, created_at: '2025-06-15T08:00:00Z',
  },
  {
    id: 'veh-007', org_id: 'org-001', plate_number: 'GR 3344-23',
    make: 'Toyota', model: 'Hilux', year: 2022, vehicle_type: 'pickup',
    colour: 'Black', vin: null, seats: 5, fuel_type: 'diesel',
    status: 'active', odometer_km: 42100,
    daily_target_pesewas: 30000, gps_device_id: null,
    archived_at: null, created_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'veh-008', org_id: 'org-001', plate_number: 'GR 5566-20',
    make: 'Hyundai', model: 'County', year: 2016, vehicle_type: 'bus',
    colour: 'White/Blue', vin: null, seats: 29, fuel_type: 'diesel',
    status: 'unavailable', odometer_km: 278900,
    daily_target_pesewas: 60000, gps_device_id: null,
    archived_at: null, created_at: '2025-03-16T10:10:00Z',
  },
];

// ── Drivers ───────────────────────────────────

export const mockDrivers: Driver[] = [
  {
    id: 'drv-001', org_id: 'org-001', user_id: 'user-003',
    full_name: 'Kwame Asante', phone: '+233244345678',
    role_type: 'driver', licence_number_enc: null,
    licence_class: 'C', licence_expiry: '2027-06-15',
    status: 'active', emergency_contact: '+233244999111',
    archived_at: null,
  },
  {
    id: 'drv-002', org_id: 'org-001', user_id: 'user-004',
    full_name: 'Yaw Boateng', phone: '+233244456789',
    role_type: 'driver', licence_number_enc: null,
    licence_class: 'B', licence_expiry: '2026-12-01',
    status: 'active', emergency_contact: '+233244999222',
    archived_at: null,
  },
  {
    id: 'drv-003', org_id: 'org-001', user_id: null,
    full_name: 'Adjei Frimpong', phone: '+233244567123',
    role_type: 'driver', licence_number_enc: null,
    licence_class: 'D', licence_expiry: '2027-03-20',
    status: 'active', emergency_contact: '+233244999333',
    archived_at: null,
  },
  {
    id: 'drv-004', org_id: 'org-001', user_id: null,
    full_name: 'Emmanuel Tetteh', phone: '+233244678234',
    role_type: 'conductor', licence_number_enc: null,
    licence_class: null, licence_expiry: null,
    status: 'active', emergency_contact: '+233244999444',
    archived_at: null,
  },
  {
    id: 'drv-005', org_id: 'org-001', user_id: null,
    full_name: 'Samuel Owusu', phone: '+233244789345',
    role_type: 'driver', licence_number_enc: null,
    licence_class: 'C', licence_expiry: '2026-11-10',
    status: 'active', emergency_contact: '+233244999555',
    archived_at: null,
  },
  {
    id: 'drv-006', org_id: 'org-001', user_id: null,
    full_name: 'Isaac Appiah', phone: '+233244890456',
    role_type: 'driver', licence_number_enc: null,
    licence_class: 'B', licence_expiry: '2026-10-15',
    status: 'suspended', emergency_contact: '+233244999666',
    archived_at: null,
  },
];

// ── Assignments ───────────────────────────────

export const mockAssignments: VehicleAssignment[] = [
  {
    id: 'asgn-001', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    starts_at: '2026-01-15T06:00:00Z', ends_at: null,
    commission_type: 'percent', commission_value: 30,
    daily_sales_target_pesewas: 35000,
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'asgn-002', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    starts_at: '2026-02-01T06:00:00Z', ends_at: null,
    commission_type: 'percent', commission_value: 25,
    daily_sales_target_pesewas: 40000,
    vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
  {
    id: 'asgn-003', org_id: 'org-001', vehicle_id: 'veh-004', driver_id: 'drv-003',
    starts_at: '2026-03-01T06:00:00Z', ends_at: null,
    commission_type: 'fixed', commission_value: 5000,
    daily_sales_target_pesewas: 25000,
    vehicle: mockVehicles[3], driver: mockDrivers[2],
  },
  {
    id: 'asgn-004', org_id: 'org-001', vehicle_id: 'veh-006', driver_id: 'drv-005',
    starts_at: '2026-04-01T06:00:00Z', ends_at: null,
    commission_type: 'percent', commission_value: 20,
    daily_sales_target_pesewas: 45000,
    vehicle: mockVehicles[5], driver: mockDrivers[4],
  },
  {
    id: 'asgn-005', org_id: 'org-001', vehicle_id: 'veh-007', driver_id: 'drv-005',
    starts_at: '2026-05-01T06:00:00Z', ends_at: '2026-08-31T18:00:00Z',
    commission_type: 'percent', commission_value: 25,
    daily_sales_target_pesewas: 30000,
    vehicle: mockVehicles[6], driver: mockDrivers[4],
  },
];

// Link vehicles to drivers
mockVehicles[0].current_driver = mockDrivers[0];
mockVehicles[1].current_driver = mockDrivers[1];
mockVehicles[3].current_driver = mockDrivers[2];
mockVehicles[5].current_driver = mockDrivers[4];

mockDrivers[0].current_vehicle = mockVehicles[0];
mockDrivers[1].current_vehicle = mockVehicles[1];
mockDrivers[2].current_vehicle = mockVehicles[3];
mockDrivers[4].current_vehicle = mockVehicles[5];

// ── Ledger Entries ────────────────────────────

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = yesterday.toISOString().slice(0, 10);

export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: 'led-001', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    trip_id: null, entry_date: todayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 38500,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-003', idempotency_key: 'idem-001',
    notes: 'Morning route Kasoa to Accra', created_at: new Date().toISOString(),
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'led-002', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    trip_id: null, entry_date: todayStr, entry_type: 'expense',
    category: 'fuel', amount_pesewas: 12000,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-003', idempotency_key: 'idem-002',
    notes: 'Shell Kaneshie', created_at: new Date().toISOString(),
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'led-003', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    trip_id: null, entry_date: todayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 42000,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-004', idempotency_key: 'idem-003',
    notes: 'Full day Madina route', created_at: new Date().toISOString(),
    vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
  {
    id: 'led-004', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    trip_id: null, entry_date: todayStr, entry_type: 'expense',
    category: 'fuel', amount_pesewas: 15000,
    payment_method: 'momo_manual', reference: 'MM-29384756', status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-004', idempotency_key: 'idem-004',
    notes: null, created_at: new Date().toISOString(),
    vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
  {
    id: 'led-005', org_id: 'org-001', vehicle_id: 'veh-004', driver_id: 'drv-003',
    trip_id: null, entry_date: todayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 27500,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-001', idempotency_key: 'idem-005',
    notes: 'Taxi Accra CBD', created_at: new Date().toISOString(),
    vehicle: mockVehicles[3], driver: mockDrivers[2],
  },
  {
    id: 'led-006', org_id: 'org-001', vehicle_id: 'veh-006', driver_id: 'drv-005',
    trip_id: null, entry_date: todayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 52000,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-001', idempotency_key: 'idem-006',
    notes: 'Cargo delivery Tema to Kumasi', created_at: new Date().toISOString(),
    vehicle: mockVehicles[5], driver: mockDrivers[4],
  },
  {
    id: 'led-007', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    trip_id: null, entry_date: todayStr, entry_type: 'commission',
    category: 'other', amount_pesewas: 11550,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-001', idempotency_key: 'idem-007',
    notes: '30% commission on GH₵ 385', created_at: new Date().toISOString(),
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'led-008', org_id: 'org-001', vehicle_id: 'veh-005', driver_id: null,
    trip_id: null, entry_date: yesterdayStr, entry_type: 'expense',
    category: 'repair', amount_pesewas: 85000,
    payment_method: 'momo_manual', reference: 'MM-83746523', status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-002', idempotency_key: 'idem-008',
    notes: 'Brake pads and disc replacement, Sprinter', created_at: yesterday.toISOString(),
    vehicle: mockVehicles[4], driver: undefined,
  },
  {
    id: 'led-009', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    trip_id: null, entry_date: yesterdayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 36000,
    payment_method: 'cash', reference: null, status: 'confirmed',
    voided_by_entry_id: null, void_reason: null,
    recorded_by: 'user-003', idempotency_key: 'idem-009',
    notes: null, created_at: yesterday.toISOString(),
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'led-010', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    trip_id: null, entry_date: yesterdayStr, entry_type: 'income',
    category: 'daily_sales', amount_pesewas: 39000,
    payment_method: 'cash', reference: null, status: 'voided',
    voided_by_entry_id: 'led-011', void_reason: 'Duplicate entry',
    recorded_by: 'user-004', idempotency_key: 'idem-010',
    notes: null, created_at: yesterday.toISOString(),
    vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
];

// ── Vehicle Documents ─────────────────────────

export const mockDocuments: VehicleDocument[] = [
  {
    id: 'doc-001', org_id: 'org-001', vehicle_id: 'veh-001',
    doc_type: 'insurance', doc_number: 'INS-2026-4421',
    issued_on: '2026-01-15', expires_on: '2027-01-14', file_url: null,
    days_until_expiry: 105, vehicle: mockVehicles[0],
  },
  {
    id: 'doc-002', org_id: 'org-001', vehicle_id: 'veh-001',
    doc_type: 'roadworthy', doc_number: 'RW-26-11234',
    issued_on: '2026-06-01', expires_on: '2026-12-01', file_url: null,
    days_until_expiry: 61, vehicle: mockVehicles[0],
  },
  {
    id: 'doc-003', org_id: 'org-001', vehicle_id: 'veh-002',
    doc_type: 'insurance', doc_number: 'INS-2026-5532',
    issued_on: '2026-03-01', expires_on: '2026-10-15', file_url: null,
    days_until_expiry: 14, vehicle: mockVehicles[1],
  },
  {
    id: 'doc-004', org_id: 'org-001', vehicle_id: 'veh-002',
    doc_type: 'roadworthy', doc_number: 'RW-26-22345',
    issued_on: '2026-04-01', expires_on: '2026-10-08', file_url: null,
    days_until_expiry: 7, vehicle: mockVehicles[1],
  },
  {
    id: 'doc-005', org_id: 'org-001', vehicle_id: 'veh-004',
    doc_type: 'registration', doc_number: 'REG-GR3456-23',
    issued_on: '2025-05-10', expires_on: '2027-05-10', file_url: null,
    days_until_expiry: 221, vehicle: mockVehicles[3],
  },
  {
    id: 'doc-006', org_id: 'org-001', vehicle_id: 'veh-005',
    doc_type: 'insurance', doc_number: 'INS-2026-6643',
    issued_on: '2026-02-01', expires_on: '2026-10-05', file_url: null,
    days_until_expiry: 4, vehicle: mockVehicles[4],
  },
];

// ── Maintenance Schedules ─────────────────────

export const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 'msched-001', org_id: 'org-001', vehicle_id: 'veh-001',
    kind: 'service', interval_km: 10000, interval_days: 90,
    last_done_on: '2026-07-15', last_done_km: 118000,
    next_due_on: '2026-10-13', next_due_km: 128000,
    vehicle: mockVehicles[0],
  },
  {
    id: 'msched-002', org_id: 'org-001', vehicle_id: 'veh-002',
    kind: 'tyres', interval_km: 40000, interval_days: null,
    last_done_on: '2026-04-01', last_done_km: 165000,
    next_due_on: null, next_due_km: 205000,
    vehicle: mockVehicles[1],
  },
  {
    id: 'msched-003', org_id: 'org-001', vehicle_id: 'veh-005',
    kind: 'brakes', interval_km: 30000, interval_days: null,
    last_done_on: '2026-09-28', last_done_km: 156000,
    next_due_on: null, next_due_km: 186000,
    vehicle: mockVehicles[4],
  },
  {
    id: 'msched-004', org_id: 'org-001', vehicle_id: 'veh-004',
    kind: 'service', interval_km: 10000, interval_days: 90,
    last_done_on: '2026-06-20', last_done_km: 60000,
    next_due_on: '2026-09-18', next_due_km: 70000,
    vehicle: mockVehicles[3],
  },
];

// ── Maintenance Records ───────────────────────

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'mrec-001', org_id: 'org-001', vehicle_id: 'veh-001',
    schedule_id: 'msched-001', performed_on: '2026-07-15',
    odometer_km: 118000, workshop: 'Kokomlemle Auto Care',
    description: 'Full service: oil, filters, plugs, belt check',
    cost_pesewas: 45000, ledger_entry_id: null,
    vehicle: mockVehicles[0],
  },
  {
    id: 'mrec-002', org_id: 'org-001', vehicle_id: 'veh-005',
    schedule_id: 'msched-003', performed_on: '2026-09-28',
    odometer_km: 156000, workshop: 'Tema Motors',
    description: 'Brake pads and disc replacement, front and rear',
    cost_pesewas: 85000, ledger_entry_id: 'led-008',
    vehicle: mockVehicles[4],
  },
  {
    id: 'mrec-003', org_id: 'org-001', vehicle_id: 'veh-002',
    schedule_id: null, performed_on: '2026-08-10',
    odometer_km: 182000, workshop: 'Madina Mechanic',
    description: 'AC compressor replacement',
    cost_pesewas: 120000, ledger_entry_id: null,
    vehicle: mockVehicles[1],
  },
];

// ── Incidents ─────────────────────────────────

export const mockIncidents: Incident[] = [
  {
    id: 'inc-001', org_id: 'org-001', vehicle_id: 'veh-005', driver_id: null,
    incident_type: 'breakdown', severity: 'high',
    description: 'Engine overheating on Accra-Kumasi highway near Nsawam. Had to pull over and call for tow.',
    location_text: 'Nsawam, Accra-Kumasi Highway',
    status: 'resolved', reported_by: 'user-002',
    reported_at: '2026-09-25T14:30:00Z', resolved_at: '2026-09-28T16:00:00Z',
    resolution_notes: 'Radiator replaced and cooling system flushed. Vehicle back in service.',
    vehicle: mockVehicles[4], driver: undefined,
  },
  {
    id: 'inc-002', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    incident_type: 'accident', severity: 'medium',
    description: 'Minor fender bender at Kaneshie traffic light. Other vehicle ran a red. No injuries.',
    location_text: 'Kaneshie, Accra',
    status: 'in_progress', reported_by: 'user-003',
    reported_at: '2026-09-29T11:45:00Z', resolved_at: null,
    resolution_notes: null,
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'inc-003', org_id: 'org-001', vehicle_id: 'veh-006', driver_id: 'drv-005',
    incident_type: 'delay', severity: 'low',
    description: 'Traffic jam due to road construction on Tema Motorway. 2 hour delay on delivery.',
    location_text: 'Tema Motorway',
    status: 'resolved', reported_by: 'user-001',
    reported_at: '2026-09-30T09:00:00Z', resolved_at: '2026-09-30T14:00:00Z',
    resolution_notes: 'Delivery completed with 2 hour delay. Client notified.',
    vehicle: mockVehicles[5], driver: mockDrivers[4],
  },
  {
    id: 'inc-004', org_id: 'org-001', vehicle_id: 'veh-004', driver_id: 'drv-003',
    incident_type: 'breakdown', severity: 'medium',
    description: 'Flat tyre near Circle. Spare tyre used.',
    location_text: 'Kwame Nkrumah Circle, Accra',
    status: 'open', reported_by: 'user-001',
    reported_at: '2026-10-01T08:30:00Z', resolved_at: null,
    resolution_notes: null,
    vehicle: mockVehicles[3], driver: mockDrivers[2],
  },
];

// ── Fuel Logs ─────────────────────────────────

export const mockFuelLogs: FuelLog[] = [
  {
    id: 'fuel-001', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    filled_on: todayStr, litres: 45, amount_pesewas: 12000,
    odometer_km: 124500, station: 'Shell Kaneshie',
    ledger_entry_id: 'led-002', vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'fuel-002', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    filled_on: todayStr, litres: 55, amount_pesewas: 15000,
    odometer_km: 189200, station: 'Goil Madina',
    ledger_entry_id: 'led-004', vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
  {
    id: 'fuel-003', org_id: 'org-001', vehicle_id: 'veh-006', driver_id: 'drv-005',
    filled_on: yesterdayStr, litres: 80, amount_pesewas: 22000,
    odometer_km: 197500, station: 'TotalEnergies Tema',
    ledger_entry_id: null, vehicle: mockVehicles[5], driver: mockDrivers[4],
  },
  {
    id: 'fuel-004', org_id: 'org-001', vehicle_id: 'veh-004', driver_id: 'drv-003',
    filled_on: yesterdayStr, litres: 35, amount_pesewas: 9500,
    odometer_km: 67500, station: 'Shell Airport',
    ledger_entry_id: null, vehicle: mockVehicles[3], driver: mockDrivers[2],
  },
];

// ── Trips ─────────────────────────────────────

export const mockTrips: Trip[] = [
  {
    id: 'trip-001', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    route_label: 'Kasoa to Accra', started_at: `${todayStr}T06:30:00Z`,
    ended_at: `${todayStr}T08:15:00Z`, start_odometer_km: 124420, end_odometer_km: 124460,
    status: 'completed', notes: 'Morning rush, full bus',
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'trip-002', org_id: 'org-001', vehicle_id: 'veh-001', driver_id: 'drv-001',
    route_label: 'Accra to Kasoa', started_at: `${todayStr}T08:30:00Z`,
    ended_at: `${todayStr}T10:00:00Z`, start_odometer_km: 124460, end_odometer_km: 124500,
    status: 'completed', notes: null,
    vehicle: mockVehicles[0], driver: mockDrivers[0],
  },
  {
    id: 'trip-003', org_id: 'org-001', vehicle_id: 'veh-002', driver_id: 'drv-002',
    route_label: 'Madina to Accra CBD', started_at: `${todayStr}T06:00:00Z`,
    ended_at: `${todayStr}T07:30:00Z`, start_odometer_km: 189100, end_odometer_km: 189150,
    status: 'completed', notes: null,
    vehicle: mockVehicles[1], driver: mockDrivers[1],
  },
  {
    id: 'trip-004', org_id: 'org-001', vehicle_id: 'veh-006', driver_id: 'drv-005',
    route_label: 'Tema to Kumasi', started_at: `${todayStr}T05:00:00Z`,
    ended_at: null, start_odometer_km: 198400, end_odometer_km: null,
    status: 'in_progress', notes: 'Cargo delivery, 3 pallets',
    vehicle: mockVehicles[5], driver: mockDrivers[4],
  },
];

// ── Notifications ─────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001', org_id: 'org-001', recipient_user_id: 'user-001', recipient_driver_id: null,
    channel: 'in_app', notif_type: 'doc_expiry',
    payload: { vehicle: 'GR 5678-21', doc_type: 'roadworthy', expires_on: '2026-10-08', days: 7 },
    status: 'sent', scheduled_for: '2026-10-01T06:00:00Z', sent_at: '2026-10-01T06:00:05Z',
    provider_ref: null, error: null,
  },
  {
    id: 'notif-002', org_id: 'org-001', recipient_user_id: 'user-001', recipient_driver_id: null,
    channel: 'in_app', notif_type: 'doc_expiry',
    payload: { vehicle: 'GR 7890-22', doc_type: 'insurance', expires_on: '2026-10-05', days: 4 },
    status: 'sent', scheduled_for: '2026-10-01T06:00:00Z', sent_at: '2026-10-01T06:00:05Z',
    provider_ref: null, error: null,
  },
  {
    id: 'notif-003', org_id: 'org-001', recipient_user_id: 'user-001', recipient_driver_id: null,
    channel: 'in_app', notif_type: 'maintenance_due',
    payload: { vehicle: 'GR 3456-23', kind: 'service', next_due_on: '2026-09-18', overdue: true },
    status: 'sent', scheduled_for: '2026-10-01T06:00:00Z', sent_at: '2026-10-01T06:00:05Z',
    provider_ref: null, error: null,
  },
  {
    id: 'notif-004', org_id: 'org-001', recipient_user_id: 'user-001', recipient_driver_id: null,
    channel: 'in_app', notif_type: 'incident',
    payload: { vehicle: 'GR 3456-23', type: 'breakdown', severity: 'medium' },
    status: 'read', scheduled_for: '2026-10-01T08:30:00Z', sent_at: '2026-10-01T08:30:02Z',
    provider_ref: null, error: null,
  },
  {
    id: 'notif-005', org_id: 'org-001', recipient_user_id: 'user-002', recipient_driver_id: null,
    channel: 'in_app', notif_type: 'maintenance_due',
    payload: { vehicle: 'GR 2345-22', kind: 'service', next_due_on: '2026-10-13', overdue: false },
    status: 'sent', scheduled_for: '2026-10-01T06:00:00Z', sent_at: '2026-10-01T06:00:05Z',
    provider_ref: null, error: null,
  },
];

// ── Audit Logs ────────────────────────────────

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'aud-001', org_id: 'org-001', actor_user_id: 'user-001',
    action: 'vehicle.create', entity_type: 'vehicle', entity_id: 'veh-007',
    before: null,
    after: { plate_number: 'GR 3344-23', make: 'Toyota', model: 'Hilux' },
    ip_address: '41.215.134.12', created_at: '2026-07-01T10:00:00Z',
    actor: mockUsers[0],
  },
  {
    id: 'aud-002', org_id: 'org-001', actor_user_id: 'user-002',
    action: 'ledger.void', entity_type: 'ledger_entry', entity_id: 'led-010',
    before: { status: 'confirmed' },
    after: { status: 'voided', void_reason: 'Duplicate entry' },
    ip_address: '41.215.134.15', created_at: '2026-09-30T14:00:00Z',
    actor: mockUsers[1],
  },
  {
    id: 'aud-003', org_id: 'org-001', actor_user_id: 'user-001',
    action: 'driver.suspend', entity_type: 'driver', entity_id: 'drv-006',
    before: { status: 'active' },
    after: { status: 'suspended' },
    ip_address: '41.215.134.12', created_at: '2026-09-15T09:00:00Z',
    actor: mockUsers[0],
  },
  {
    id: 'aud-004', org_id: 'org-001', actor_user_id: 'user-001',
    action: 'assignment.create', entity_type: 'vehicle_assignment', entity_id: 'asgn-004',
    before: null,
    after: { vehicle_id: 'veh-006', driver_id: 'drv-005', commission_type: 'percent', commission_value: 20 },
    ip_address: '41.215.134.12', created_at: '2026-04-01T08:00:00Z',
    actor: mockUsers[0],
  },
];

// ── Fleet Stats ───────────────────────────────

export const mockFleetStats: FleetStats = {
  total_vehicles: 8,
  active: 5,
  idle: 1,
  maintenance: 1,
  unavailable: 1,
  total_drivers: 6,
  active_drivers: 5,
  today_income_pesewas: 160000,
  today_expenses_pesewas: 27000,
  this_week_income_pesewas: 945000,
  this_week_expenses_pesewas: 185000,
  this_month_income_pesewas: 4280000,
  this_month_expenses_pesewas: 890000,
  docs_expiring_soon: 3,
  maintenance_overdue: 1,
  open_incidents: 1,
};

// ── Daily Totals (last 14 days) ───────────────

export const mockDailyTotals: DailyTotal[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const isWeekend = d.getDay() === 0;
  const baseIncome = isWeekend ? 90000 : 155000;
  const baseExpense = isWeekend ? 20000 : 35000;
  return {
    date: d.toISOString().slice(0, 10),
    income_pesewas: baseIncome + Math.floor(Math.random() * 30000) - 15000,
    expense_pesewas: baseExpense + Math.floor(Math.random() * 15000) - 7500,
  };
});
