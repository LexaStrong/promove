'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle, Search } from 'lucide-react';
import { IncidentStatus, IncidentType, Severity } from '@/lib/types';
import { useFleet } from '@/lib/fleet-context';

export default function IncidentsPage() {
  const { incidents, vehicles, drivers, addIncident } = useFleet();
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    vehicle_id: string;
    driver_id: string;
    incident_type: IncidentType;
    severity: Severity;
    description: string;
    location_text: string;
  }>({
    vehicle_id: '',
    driver_id: '',
    incident_type: 'breakdown',
    severity: 'medium',
    description: '',
    location_text: '',
  });

  const filtered = incidents.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (search && !`${i.vehicle?.plate_number || ''} ${i.driver?.full_name || ''} ${i.description} ${i.location_text || ''}`
      .toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id) {
      alert('Please select a vehicle');
      return;
    }
    addIncident({
      vehicle_id: formData.vehicle_id,
      driver_id: formData.driver_id || null,
      incident_type: formData.incident_type,
      severity: formData.severity,
      description: formData.description,
      location_text: formData.location_text || null,
    });
    setFormData({
      vehicle_id: '',
      driver_id: '',
      incident_type: 'breakdown',
      severity: 'medium',
      description: '',
      location_text: '',
    });
    setShowAddModal(false);
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'var(--pm-error)';
      case 'high': return '#BF6900';
      case 'medium': return 'var(--pm-warning)';
      default: return 'var(--pm-text-muted)';
    }
  };

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Incidents</h1>
          <p className="pm-page-subtitle">Breakdowns, accidents, delays, and theft</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Report Incident
        </button>
      </div>

      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Open</div>
          <div className="pm-stat-value" style={{ color: 'var(--pm-error)' }}>
            {incidents.filter(i => i.status === 'open').length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">In Progress</div>
          <div className="pm-stat-value" style={{ color: 'var(--pm-warning)' }}>
            {incidents.filter(i => i.status === 'in_progress').length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Resolved</div>
          <div className="pm-stat-value" style={{ color: 'var(--pm-success)' }}>
            {incidents.filter(i => i.status === 'resolved').length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total</div>
          <div className="pm-stat-value">{incidents.length}</div>
        </div>
      </div>

      <div className="pm-tabs">
        {[
          { key: '', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' },
        ].map(tab => (
          <button key={tab.key} className={`pm-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key as IncidentStatus | '')}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 'var(--pm-space-4)', maxWidth: 320, position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--pm-text-muted)', pointerEvents: 'none',
        }} />
        <input type="text" className="pm-input" placeholder="Search incidents..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
        {filtered.map(inc => (
          <div key={inc.id} className="pm-card" style={{ padding: 'var(--pm-space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                  background: `${severityColor(inc.severity)}15`,
                  color: severityColor(inc.severity),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {inc.incident_type}
                    <span className={`pm-badge pm-badge-${inc.severity}`} style={{ marginLeft: 8 }}>
                      {inc.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>
                    <Link href={`/vehicles/${inc.vehicle_id}`} style={{ fontWeight: 500 }}>
                      {inc.vehicle?.plate_number}
                    </Link>
                    {inc.driver && <> • {inc.driver.full_name}</>}
                  </div>
                </div>
              </div>
              <span className={`pm-badge pm-badge-${inc.status}`}>
                {inc.status.replace('_', ' ')}
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--pm-text)', lineHeight: 1.5, marginBottom: 8 }}>
              {inc.description}
            </p>

            <div style={{ display: 'flex', gap: 'var(--pm-space-6)', fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
              {inc.location_text && <span>Location: {inc.location_text}</span>}
              <span>Reported: {new Date(inc.reported_at).toLocaleString('en-GH')}</span>
              {inc.resolved_at && <span>Resolved: {new Date(inc.resolved_at).toLocaleString('en-GH')}</span>}
            </div>

            {inc.resolution_notes && (
              <div style={{
                marginTop: 10, padding: '8px 12px', background: 'var(--pm-bg-subtle)',
                borderRadius: 'var(--pm-radius-md)', fontSize: '0.8125rem', color: 'var(--pm-text-secondary)',
              }}>
                Resolution: {inc.resolution_notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><AlertTriangle size={24} /></div>
          <div className="pm-empty-title">No incidents found</div>
          <div className="pm-empty-desc">No incidents match your current filters.</div>
        </div>
      )}

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>Report Incident</h3>
              <button className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Vehicle</label>
                      <select
                        className="pm-select"
                        required
                        value={formData.vehicle_id}
                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                      >
                        <option value="">Select vehicle</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Driver</label>
                      <select
                        className="pm-select"
                        value={formData.driver_id}
                        onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                      >
                        <option value="">Select driver</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Type</label>
                      <select
                        className="pm-select"
                        value={formData.incident_type}
                        onChange={e => setFormData({ ...formData, incident_type: e.target.value as IncidentType })}
                      >
                        <option value="breakdown">Breakdown</option>
                        <option value="accident">Accident</option>
                        <option value="delay">Delay</option>
                        <option value="theft">Theft</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Severity</label>
                      <select
                        className="pm-select"
                        value={formData.severity}
                        onChange={e => setFormData({ ...formData, severity: e.target.value as Severity })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Description</label>
                    <textarea
                      className="pm-textarea"
                      placeholder="What happened?"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Location</label>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="e.g. Kaneshie, Accra"
                      value={formData.location_text}
                      onChange={e => setFormData({ ...formData, location_text: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
