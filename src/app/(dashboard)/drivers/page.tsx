'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Phone, Shield } from 'lucide-react';
import { mockAssignments } from '@/lib/mock-data';
import { useFleet } from '@/lib/fleet-context';
import { Driver, DriverRoleType, DriverStatus } from '@/lib/types';
import { Lock, ShieldCheck } from 'lucide-react';

const CURRENT_DATE_MS = new Date('2026-10-01T00:00:00Z').getTime();
const NINETY_DAYS_MS = 90 * 86400000;

function isLicenceExpiringSoon(licenceExpiry: string | null): boolean {
  if (!licenceExpiry) return false;
  const expiry = new Date(licenceExpiry).getTime();
  return expiry - CURRENT_DATE_MS < NINETY_DAYS_MS && expiry > CURRENT_DATE_MS;
}

export default function DriversPage() {
  const { drivers, addDriver, isDemo } = useFleet();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<DriverRoleType | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New driver form state
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    phone: '+233 ',
    role_type: 'driver' as DriverRoleType,
    licence_number: '',
    licence_class: 'C',
    licence_expiry: '2027-12-31',
    emergency_contact: '',
    sms_consent_given: true,
    location_consent_given: true,
  });

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.full_name || !newDriver.phone) return;

    addDriver({
      full_name: newDriver.full_name,
      phone: newDriver.phone,
      role_type: newDriver.role_type,
      licence_number_enc: newDriver.licence_number,
      licence_class: newDriver.licence_class,
      licence_expiry: newDriver.licence_expiry,
      status: 'active',
    });

    setShowAddModal(false);
    setNewDriver({
      full_name: '',
      phone: '+233 ',
      role_type: 'driver',
      licence_number: '',
      licence_class: 'C',
      licence_expiry: '2027-12-31',
      emergency_contact: '',
      sms_consent_given: true,
      location_consent_given: true,
    });
  };

  const filtered = drivers.filter(d => {
    if (d.archived_at) return false;
    if (search && !`${d.full_name} ${d.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    if (roleFilter && d.role_type !== roleFilter) return false;
    return true;
  });

  const getAssignment = (driverId: string) =>
    isDemo ? mockAssignments.find(a => a.driver_id === driverId && !a.ends_at) : undefined;

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Drivers & Conductors</h1>
          <p className="pm-page-subtitle">
            {drivers.filter(d => d.status === 'active').length} active operators registered in your fleet
          </p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Driver / Conductor
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--pm-space-3)', marginBottom: 'var(--pm-space-4)', flexWrap: 'wrap' }}>
        <div className="pm-tabs" style={{ marginBottom: 0 }}>
          {[
            { key: '', label: 'All', count: drivers.filter(d => !d.archived_at).length },
            { key: 'active', label: 'Active', count: drivers.filter(d => d.status === 'active').length },
            { key: 'suspended', label: 'Suspended', count: drivers.filter(d => d.status === 'suspended').length },
            { key: 'left', label: 'Left', count: drivers.filter(d => d.status === 'left').length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`pm-tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.key as DriverStatus | '')}
            >
              {tab.label}
              <span style={{
                marginLeft: 6, fontSize: '0.6875rem', background: 'var(--pm-bg-muted)',
                padding: '1px 8px', borderRadius: 'var(--pm-radius-full)',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <select
          className="pm-select"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as DriverRoleType | '')}
          style={{ width: 160 }}
        >
          <option value="">All Roles</option>
          <option value="driver">Drivers Only</option>
          <option value="conductor">Conductors Only</option>
        </select>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--pm-space-4)', maxWidth: 320, position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--pm-text-muted)', pointerEvents: 'none',
        }} />
        <input
          type="text" className="pm-input" placeholder="Search by name or phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Grid of driver cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--pm-space-4)',
      }}>
        {filtered.map(driver => {
          const assignment = getAssignment(driver.id);
          return (
            <Link key={driver.id} href={`/drivers/${driver.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="pm-card" style={{
                padding: 'var(--pm-space-5)',
                transition: 'box-shadow var(--pm-transition)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--pm-shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--pm-shadow-sm)')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div className="pm-topbar-avatar" style={{ width: 48, height: 48, fontSize: '1rem', flexShrink: 0 }}>
                    {driver.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{driver.full_name}</div>
                      <span className={`pm-badge pm-badge-${driver.status}`}>{driver.status}</span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 4,
                    }}>
                      <Phone size={13} /> {driver.phone}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem', color: 'var(--pm-text-muted)', marginTop: 2,
                      textTransform: 'capitalize',
                    }}>
                      {driver.role_type}
                      {driver.licence_class ? ` • Class ${driver.licence_class}` : ''}
                    </div>

                    {assignment && (
                      <div style={{
                        marginTop: 10, padding: '8px 12px',
                        background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)',
                        fontSize: '0.8125rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                          <Shield size={13} style={{ color: 'var(--pm-blue-500)' }} />
                          {assignment.vehicle?.plate_number}
                        </div>
                        <div style={{ color: 'var(--pm-text-muted)', marginTop: 2, fontSize: '0.75rem' }}>
                          {assignment.commission_type === 'percent'
                            ? `${assignment.commission_value}% commission`
                            : assignment.commission_type === 'fixed'
                              ? `GH₵ ${(assignment.commission_value / 100).toFixed(0)} fixed`
                              : 'No commission'}
                        </div>
                      </div>
                    )}

                    {driver.licence_expiry && (
                      <div style={{
                        marginTop: 8, fontSize: '0.75rem', color: 'var(--pm-text-muted)',
                      }}>
                        Licence expires: {driver.licence_expiry}
                        {isLicenceExpiringSoon(driver.licence_expiry) && (
                          <span className="pm-badge pm-badge-pending" style={{ marginLeft: 8 }}>
                            Expiring soon
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><Users size={24} /></div>
          <div className="pm-empty-title">No drivers found</div>
          <div className="pm-empty-desc">
            {search || statusFilter ? 'Try adjusting your filters' : 'Add your first driver to get started'}
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <form onSubmit={handleAddDriver}>
              <div className="pm-modal-header">
                <h3>Add Driver or Conductor</h3>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <div className="pm-input-group">
                    <label className="pm-label">Full Name *</label>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="e.g. Kwame Asante"
                      value={newDriver.full_name}
                      onChange={e => setNewDriver({ ...newDriver, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Ghana Mobile Phone *</label>
                    <input
                      type="tel"
                      className="pm-input"
                      placeholder="+233 24 123 4567"
                      value={newDriver.phone}
                      onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Fleet Role</label>
                      <select
                        className="pm-select"
                        value={newDriver.role_type}
                        onChange={e => setNewDriver({ ...newDriver, role_type: e.target.value as DriverRoleType })}
                      >
                        <option value="driver">Driver</option>
                        <option value="conductor">Conductor</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Licence Class</label>
                      <select
                        className="pm-select"
                        value={newDriver.licence_class}
                        onChange={e => setNewDriver({ ...newDriver, licence_class: e.target.value })}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label className="pm-label" style={{ marginBottom: 0 }}>Licence Number</label>
                        <span className="pm-badge pm-badge-neutral" style={{ fontSize: '0.625rem' }}>
                          <Lock size={10} style={{ display: 'inline', marginRight: 2 }} /> AES-256 Encrypted
                        </span>
                      </div>
                      <input
                        type="text"
                        className="pm-input"
                        placeholder="e.g. GR-24-91823"
                        value={newDriver.licence_number}
                        onChange={e => setNewDriver({ ...newDriver, licence_number: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Licence Expiry</label>
                      <input
                        type="date"
                        className="pm-input"
                        value={newDriver.licence_expiry}
                        onChange={e => setNewDriver({ ...newDriver, licence_expiry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pm-input-group">
                    <label className="pm-label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      className="pm-input"
                      placeholder="+233 20 000 0000"
                      value={newDriver.emergency_contact}
                      onChange={e => setNewDriver({ ...newDriver, emergency_contact: e.target.value })}
                    />
                  </div>

                  {/* Statutory Consent Box (Ghana Act 843) */}
                  <div style={{
                    marginTop: 'var(--pm-space-2)',
                    padding: 'var(--pm-space-3) var(--pm-space-4)',
                    background: 'var(--pm-bg-subtle)',
                    borderRadius: 'var(--pm-radius-md)',
                    border: '1px solid var(--pm-border)',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pm-text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} style={{ color: 'var(--pm-blue-500)' }} />
                      Statutory Consent Records (Act 843 Compliance)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newDriver.sms_consent_given}
                          onChange={e => setNewDriver({ ...newDriver, sms_consent_given: e.target.checked })}
                          style={{ marginTop: 2 }}
                        />
                        <span>
                          Driver has given explicit opt-in consent to receive operational SMS alerts and reminders.
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newDriver.location_consent_given}
                          onChange={e => setNewDriver({ ...newDriver, location_consent_given: e.target.checked })}
                          style={{ marginTop: 2 }}
                        />
                        <span>
                          Driver has signed written consent for vehicle location tracking during assigned operational shifts.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Add Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
