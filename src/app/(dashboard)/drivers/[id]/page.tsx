'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Phone, Calendar, Shield, BookOpen, AlertTriangle, Edit,
  Lock, CheckCircle2, ShieldCheck, Car, Archive, UserCheck,
} from 'lucide-react';
import { formatPesewas, Driver, DriverRoleType, DriverStatus, CommissionType, VehicleAssignment } from '@/lib/types';
import {
  mockDrivers, mockAssignments, mockLedgerEntries, mockIncidents,
  mockFuelLogs, mockVehicles,
} from '@/lib/mock-data';

export default function DriverDetailPage() {
  const params = useParams();
  const initialDriver = mockDrivers.find(d => d.id === params.id);
  const [driver, setDriver] = useState<Driver | undefined>(initialDriver);
  const [currentAssignment, setCurrentAssignment] = useState<VehicleAssignment | undefined>(
    mockAssignments.find(a => a.driver_id === params.id && !a.ends_at)
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: initialDriver?.full_name || '',
    phone: initialDriver?.phone || '',
    role_type: (initialDriver?.role_type || 'driver') as DriverRoleType,
    licence_number: 'GR-24-91823',
    licence_class: initialDriver?.licence_class || 'C',
    licence_expiry: initialDriver?.licence_expiry || '2027-12-31',
    emergency_contact: initialDriver?.emergency_contact || '+233244000000',
    sms_consent_given: initialDriver?.sms_consent_given ?? true,
    location_consent_given: initialDriver?.location_consent_given ?? true,
  });

  // Assign form state
  const [assignForm, setAssignForm] = useState({
    vehicle_id: currentAssignment?.vehicle_id || mockVehicles[0]?.id || '',
    commission_type: (currentAssignment?.commission_type || 'percent') as CommissionType,
    commission_value: currentAssignment?.commission_value || 15,
    daily_sales_target: 350,
  });

  if (!driver) {
    return (
      <div className="pm-empty">
        <div className="pm-empty-title">Driver not found</div>
        <Link href="/drivers" className="pm-btn pm-btn-primary" style={{ marginTop: 16 }}>Back to Drivers</Link>
      </div>
    );
  }

  const pastAssignments = mockAssignments.filter(a => a.driver_id === driver.id && a.ends_at);
  const driverLedger = mockLedgerEntries.filter(e => e.driver_id === driver.id && e.status === 'confirmed');
  const driverIncidents = mockIncidents.filter(i => i.driver_id === driver.id);
  const driverFuel = mockFuelLogs.filter(f => f.driver_id === driver.id);

  const totalIncome = driverLedger.filter(e => e.entry_type === 'income').reduce((s, e) => s + e.amount_pesewas, 0);
  const totalExpenses = driverLedger.filter(e => e.entry_type === 'expense').reduce((s, e) => s + e.amount_pesewas, 0);

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setDriver({
      ...driver,
      full_name: editForm.full_name,
      phone: editForm.phone,
      role_type: editForm.role_type,
      licence_class: editForm.licence_class,
      licence_expiry: editForm.licence_expiry,
      emergency_contact: editForm.emergency_contact,
      sms_consent_given: editForm.sms_consent_given,
      sms_consent_at: editForm.sms_consent_given ? new Date().toISOString() : null,
      location_consent_given: editForm.location_consent_given,
      location_consent_at: editForm.location_consent_given ? new Date().toISOString() : null,
    });
    setShowEditModal(false);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = mockVehicles.find(v => v.id === assignForm.vehicle_id);
    const updated: VehicleAssignment = {
      id: `asgn-${Date.now()}`,
      org_id: 'org-demo',
      vehicle_id: assignForm.vehicle_id,
      driver_id: driver.id,
      starts_at: new Date().toISOString().slice(0, 10),
      ends_at: null,
      commission_type: assignForm.commission_type,
      commission_value: Number(assignForm.commission_value),
      daily_sales_target_pesewas: Number(assignForm.daily_sales_target) * 100,
      vehicle: veh,
      driver: driver,
    };
    setCurrentAssignment(updated);
    setShowAssignModal(false);
  };

  return (
    <div>
      <Link href="/drivers" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-3)',
      }}>
        <ArrowLeft size={14} /> Back to Drivers
      </Link>

      <div className="pm-page-header" style={{ marginBottom: 'var(--pm-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="pm-topbar-avatar" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>
            {driver.full_name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="pm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {driver.full_name}
              <span className={`pm-badge pm-badge-${driver.status}`}>{driver.status}</span>
            </h1>
            <p className="pm-page-subtitle" style={{ textTransform: 'capitalize' }}>
              {driver.role_type}
              {driver.licence_class ? ` • Licence Class ${driver.licence_class}` : ''}
            </p>
          </div>
        </div>
        <button className="pm-btn pm-btn-secondary" onClick={() => setShowEditModal(true)}>
          <Edit size={16} /> Edit Driver
        </button>
      </div>

      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Income</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalIncome)}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Expenses</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalExpenses)}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Fuel Entries</div>
          <div className="pm-stat-value">{driverFuel.length}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Incidents</div>
          <div className="pm-stat-value">{driverIncidents.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--pm-space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          {/* Current Assignment */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} /> Current Assignment
              </h3>
              <button
                className="pm-btn pm-btn-secondary pm-btn-sm"
                onClick={() => setShowAssignModal(true)}
              >
                <Car size={14} /> Change Assignment
              </button>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              {currentAssignment ? (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                    <Link href={`/vehicles/${currentAssignment.vehicle_id}`}>
                      {currentAssignment.vehicle?.plate_number}
                    </Link>
                    {' '}{currentAssignment.vehicle?.make} {currentAssignment.vehicle?.model}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginTop: 4 }}>
                    Since {new Date(currentAssignment.starts_at).toLocaleDateString('en-GH')}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pm-text-muted)', marginTop: 2 }}>
                    Commission: {currentAssignment.commission_type === 'percent'
                      ? `${currentAssignment.commission_value}%`
                      : currentAssignment.commission_type === 'fixed'
                        ? formatPesewas(currentAssignment.commission_value)
                        : 'None'}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--pm-text-muted)' }}>Not currently assigned to a vehicle.</div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)', borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} /> Recent Transactions
              </h3>
            </div>
            {driverLedger.length > 0 ? (
              <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Vehicle</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverLedger.slice(0, 8).map(e => (
                      <tr key={e.id}>
                        <td>{e.entry_date}</td>
                        <td>{e.vehicle?.plate_number}</td>
                        <td><span className={`pm-badge pm-badge-${e.entry_type}`}>{e.entry_type}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }} className="pm-text-money">
                          {formatPesewas(e.amount_pesewas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center', color: 'var(--pm-text-muted)' }}>
                No transactions recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          <div className="pm-card">
            <div style={{ padding: 'var(--pm-space-4) var(--pm-space-5)', borderBottom: '1px solid var(--pm-border)' }}>
              <h3>Driver Details</h3>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              {[
                { label: 'Phone', value: driver.phone },
                { label: 'Fleet Role', value: driver.role_type },
                { label: 'Licence Class', value: driver.licence_class || '-' },
                { label: 'Licence Expiry', value: driver.licence_expiry || '-' },
                { label: 'Licence Number', value: 'AES-256 Encrypted (Protected)' },
                { label: 'SMS Consent (Act 843)', value: driver.sms_consent_given !== false ? 'Granted' : 'Not Granted' },
                { label: 'Location Consent (Act 843)', value: driver.location_consent_given !== false ? 'Granted' : 'Not Granted' },
                { label: 'Emergency Contact', value: driver.emergency_contact || '-' },
                { label: 'Driver App Login', value: driver.user_id ? 'Active' : 'Unregistered' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--pm-border-subtle)',
                  fontSize: '0.875rem',
                }}>
                  <span style={{ color: 'var(--pm-text-secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Assignments */}
          {pastAssignments.length > 0 && (
            <div className="pm-card">
              <div style={{ padding: 'var(--pm-space-4) var(--pm-space-5)', borderBottom: '1px solid var(--pm-border)' }}>
                <h3>Assignment History</h3>
              </div>
              <div style={{ padding: 'var(--pm-space-4) var(--pm-space-5)' }}>
                {pastAssignments.map(a => (
                  <div key={a.id} style={{ fontSize: '0.875rem', padding: '6px 0' }}>
                    <div style={{ fontWeight: 500 }}>{a.vehicle?.plate_number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      {new Date(a.starts_at).toLocaleDateString('en-GH')} to {a.ends_at ? new Date(a.ends_at).toLocaleDateString('en-GH') : 'Current'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Driver Modal */}
      {showEditModal && (
        <div className="pm-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <form onSubmit={handleSaveDriver}>
              <div className="pm-modal-header">
                <h3>Edit Operator: {driver.full_name}</h3>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <div className="pm-input-group">
                    <label className="pm-label">Full Name</label>
                    <input
                      type="text"
                      className="pm-input"
                      value={editForm.full_name}
                      onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Phone Number</label>
                    <input
                      type="tel"
                      className="pm-input"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Role</label>
                      <select
                        className="pm-select"
                        value={editForm.role_type}
                        onChange={e => setEditForm({ ...editForm, role_type: e.target.value as DriverRoleType })}
                      >
                        <option value="driver">Driver</option>
                        <option value="conductor">Conductor</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Licence Class</label>
                      <select
                        className="pm-select"
                        value={editForm.licence_class || ''}
                        onChange={e => setEditForm({ ...editForm, licence_class: e.target.value })}
                      >
                        <option value="">None / Conductor</option>
                        <option value="B">Class B</option>
                        <option value="C">Class C</option>
                        <option value="D">Class D</option>
                        <option value="E">Class E</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Licence Expiry</label>
                      <input
                        type="date"
                        className="pm-input"
                        value={editForm.licence_expiry || ''}
                        onChange={e => setEditForm({ ...editForm, licence_expiry: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Emergency Contact</label>
                      <input
                        type="tel"
                        className="pm-input"
                        value={editForm.emergency_contact || ''}
                        onChange={e => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Statutory Consents */}
                  <div style={{
                    padding: 'var(--pm-space-3) var(--pm-space-4)',
                    background: 'var(--pm-bg-subtle)',
                    borderRadius: 'var(--pm-radius-md)',
                    border: '1px solid var(--pm-border)',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} style={{ color: 'var(--pm-blue-500)' }} />
                      Act 843 Statutory Consents
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', marginBottom: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editForm.sms_consent_given}
                        onChange={e => setEditForm({ ...editForm, sms_consent_given: e.target.checked })}
                      />
                      SMS operational reminders opt-in confirmed
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editForm.location_consent_given}
                        onChange={e => setEditForm({ ...editForm, location_consent_given: e.target.checked })}
                      />
                      Shift location tracking consent confirmed
                    </label>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Vehicle Assignment Modal */}
      {showAssignModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <form onSubmit={handleSaveAssignment}>
              <div className="pm-modal-header">
                <h3>Assign Vehicle & Terms: {driver.full_name}</h3>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAssignModal(false)}>×</button>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <div className="pm-input-group">
                    <label className="pm-label">Assign to Vehicle</label>
                    <select
                      className="pm-select"
                      value={assignForm.vehicle_id}
                      onChange={e => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}
                    >
                      {mockVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.plate_number} : {v.make} {v.model} ({v.vehicle_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Commission Model</label>
                      <select
                        className="pm-select"
                        value={assignForm.commission_type}
                        onChange={e => setAssignForm({ ...assignForm, commission_type: e.target.value as CommissionType })}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Pesewas / Cedis</option>
                        <option value="none">No Commission</option>
                      </select>
                    </div>

                    <div className="pm-input-group">
                      <label className="pm-label">
                        {assignForm.commission_type === 'percent' ? 'Rate (%)' : 'Amount (GH₵)'}
                      </label>
                      <input
                        type="number"
                        className="pm-input"
                        value={assignForm.commission_value}
                        onChange={e => setAssignForm({ ...assignForm, commission_value: parseFloat(e.target.value) || 0 })}
                        disabled={assignForm.commission_type === 'none'}
                      />
                    </div>
                  </div>

                  <div className="pm-input-group">
                    <label className="pm-label">Daily Sales Target (GH₵)</label>
                    <input
                      type="number"
                      className="pm-input"
                      value={assignForm.daily_sales_target}
                      onChange={e => setAssignForm({ ...assignForm, daily_sales_target: parseFloat(e.target.value) || 0 })}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', display: 'block', marginTop: 4 }}>
                      Used to calculate performance targets on daily shifts and driver reports.
                    </span>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
