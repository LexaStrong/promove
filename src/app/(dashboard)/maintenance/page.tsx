'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Wrench, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatPesewas } from '@/lib/types';
import { useFleet } from '@/lib/fleet-context';

export default function MaintenancePage() {
  const { maintenanceSchedules, maintenanceRecords, vehicles, isDemo } = useFleet();
  const [tab, setTab] = useState<'schedules' | 'records'>('schedules');
  const [showAddModal, setShowAddModal] = useState(false);

  const overdueSchedules = maintenanceSchedules.filter(
    s => s.next_due_on && new Date(s.next_due_on) < new Date()
  );
  const upcomingSchedules = maintenanceSchedules.filter(
    s => s.next_due_on && new Date(s.next_due_on) >= new Date()
  );
  const kmSchedules = maintenanceSchedules.filter(
    s => !s.next_due_on && s.next_due_km
  );

  const totalCost = maintenanceRecords.reduce((s, r) => s + (r.cost_pesewas || 0), 0);

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Maintenance</h1>
          <p className="pm-page-subtitle">Service schedules and maintenance history</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> {tab === 'schedules' ? 'Add Schedule' : 'Record Work'}
        </button>
      </div>

      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Overdue</div>
          <div className="pm-stat-value" style={{ color: overdueSchedules.length > 0 ? 'var(--pm-error)' : 'var(--pm-success)' }}>
            {overdueSchedules.length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Upcoming</div>
          <div className="pm-stat-value">{upcomingSchedules.length}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Records</div>
          <div className="pm-stat-value">{maintenanceRecords.length}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Spent</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalCost)}</div>
        </div>
      </div>

      <div className="pm-tabs">
        <button className={`pm-tab ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>
          Schedules ({maintenanceSchedules.length})
        </button>
        <button className={`pm-tab ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>
          History ({maintenanceRecords.length})
        </button>
      </div>

      {tab === 'schedules' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          {/* Overdue */}
          {overdueSchedules.length > 0 && (
            <div>
              <h4 style={{ color: 'var(--pm-error)', marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} /> Overdue
              </h4>
              {overdueSchedules.map(s => (
                <div key={s.id} className="pm-card" style={{
                  padding: 'var(--pm-space-4) var(--pm-space-5)', marginBottom: 'var(--pm-space-3)',
                  borderLeft: '3px solid var(--pm-error)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        <Link href={`/vehicles/${s.vehicle_id}`}>{s.vehicle?.plate_number}</Link>
                        {' • '}<span style={{ textTransform: 'capitalize' }}>{s.kind}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                        {s.interval_km ? `Every ${s.interval_km.toLocaleString()} km` : ''}
                        {s.interval_km && s.interval_days ? ' or ' : ''}
                        {s.interval_days ? `Every ${s.interval_days} days` : ''}
                        {s.last_done_on ? ` • Last done ${s.last_done_on}` : ''}
                      </div>
                    </div>
                    <span className="pm-badge pm-badge-critical">
                      Due {s.next_due_on}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {upcomingSchedules.length > 0 && (
            <div>
              <h4 style={{ color: 'var(--pm-warning)', marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} /> Upcoming
              </h4>
              {upcomingSchedules.map(s => (
                <div key={s.id} className="pm-card" style={{
                  padding: 'var(--pm-space-4) var(--pm-space-5)', marginBottom: 'var(--pm-space-3)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        <Link href={`/vehicles/${s.vehicle_id}`}>{s.vehicle?.plate_number}</Link>
                        {' • '}<span style={{ textTransform: 'capitalize' }}>{s.kind}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                        {s.interval_km ? `Every ${s.interval_km.toLocaleString()} km` : ''}
                        {s.interval_km && s.interval_days ? ' or ' : ''}
                        {s.interval_days ? `Every ${s.interval_days} days` : ''}
                      </div>
                    </div>
                    <span className="pm-badge pm-badge-pending">Due {s.next_due_on}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* KM-only schedules */}
          {kmSchedules.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Distance-based
              </h4>
              {kmSchedules.map(s => (
                <div key={s.id} className="pm-card" style={{
                  padding: 'var(--pm-space-4) var(--pm-space-5)', marginBottom: 'var(--pm-space-3)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {s.vehicle?.plate_number} • <span style={{ textTransform: 'capitalize' }}>{s.kind}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                        Every {s.interval_km?.toLocaleString()} km
                      </div>
                    </div>
                    <span className="pm-badge pm-badge-idle">
                      Due at {s.next_due_km?.toLocaleString()} km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {maintenanceSchedules.length === 0 && (
            <div className="pm-empty">
              <div className="pm-empty-icon"><Wrench size={24} /></div>
              <div className="pm-empty-title">No maintenance schedules</div>
              <div className="pm-empty-desc">Create your first service schedule to track routine inspections and maintenance intervals.</div>
            </div>
          )}
        </div>
      ) : (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Workshop</th>
                <th style={{ textAlign: 'right' }}>Odometer</th>
                <th style={{ textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map(r => (
                <tr key={r.id}>
                  <td>{r.performed_on}</td>
                  <td style={{ fontWeight: 500 }}>{r.vehicle?.plate_number || 'Fleet Vehicle'}</td>
                  <td style={{ maxWidth: 300 }}>{r.description}</td>
                  <td style={{ color: 'var(--pm-text-secondary)' }}>{r.workshop || '-'}</td>
                  <td style={{ textAlign: 'right', color: 'var(--pm-text-secondary)' }}>
                    {r.odometer_km ? `${r.odometer_km.toLocaleString()} km` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }} className="pm-text-money">
                    {r.cost_pesewas ? formatPesewas(r.cost_pesewas) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {maintenanceRecords.length === 0 && (
            <div className="pm-empty">
              <div className="pm-empty-icon"><Wrench size={24} /></div>
              <div className="pm-empty-title">No maintenance history recorded</div>
              <div className="pm-empty-desc">Log oil changes, tyre replacements, and brake repairs to track operating expenses.</div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>{tab === 'schedules' ? 'Add Schedule' : 'Record Maintenance'}</h3>
              <button className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-form-group">
                <div className="pm-input-group">
                  <label className="pm-label">Vehicle</label>
                  <select className="pm-select">
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} ({v.make} {v.model})</option>)}
                  </select>
                </div>
                {tab === 'schedules' ? (
                  <>
                    <div className="pm-input-group">
                      <label className="pm-label">Kind</label>
                      <select className="pm-select">
                        <option value="service">Service</option>
                        <option value="inspection">Inspection</option>
                        <option value="tyres">Tyres</option>
                        <option value="brakes">Brakes</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                      <div className="pm-input-group">
                        <label className="pm-label">Interval (km)</label>
                        <input type="number" className="pm-input" placeholder="e.g. 10000" />
                      </div>
                      <div className="pm-input-group">
                        <label className="pm-label">Interval (days)</label>
                        <input type="number" className="pm-input" placeholder="e.g. 90" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pm-input-group">
                      <label className="pm-label">Date Performed</label>
                      <input type="date" className="pm-input" />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Description</label>
                      <textarea className="pm-textarea" placeholder="What work was done?" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                      <div className="pm-input-group">
                        <label className="pm-label">Workshop</label>
                        <input type="text" className="pm-input" placeholder="Workshop name" />
                      </div>
                      <div className="pm-input-group">
                        <label className="pm-label">Cost (GH₵)</label>
                        <input type="number" className="pm-input" placeholder="0.00" step="0.01" />
                      </div>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Odometer (km)</label>
                      <input type="number" className="pm-input" placeholder="Current reading" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="pm-modal-footer">
              <button className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
