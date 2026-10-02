'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Map, Search, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { mockTrips, mockVehicles, mockDrivers } from '@/lib/mock-data';
import { TripStatus } from '@/lib/types';

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState<TripStatus | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = mockTrips.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Trips</h1>
          <p className="pm-page-subtitle">Manual trip log with routes and odometer readings</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Log Trip
        </button>
      </div>

      <div className="pm-tabs">
        {[
          { key: '', label: 'All', count: mockTrips.length },
          { key: 'in_progress', label: 'In Progress', count: mockTrips.filter(t => t.status === 'in_progress').length },
          { key: 'completed', label: 'Completed', count: mockTrips.filter(t => t.status === 'completed').length },
          { key: 'planned', label: 'Planned', count: mockTrips.filter(t => t.status === 'planned').length },
        ].map(tab => (
          <button key={tab.key} className={`pm-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key as TripStatus | '')}>
            {tab.label}
            <span style={{
              marginLeft: 6, fontSize: '0.6875rem', background: 'var(--pm-bg-muted)',
              padding: '1px 8px', borderRadius: 'var(--pm-radius-full)',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
        {filtered.map(trip => {
          const distance = trip.start_odometer_km && trip.end_odometer_km
            ? trip.end_odometer_km - trip.start_odometer_km
            : null;
          const duration = trip.started_at && trip.ended_at
            ? Math.round((new Date(trip.ended_at).getTime() - new Date(trip.started_at).getTime()) / 60000)
            : null;

          return (
            <div key={trip.id} className="pm-card" style={{ padding: 'var(--pm-space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                    background: 'var(--pm-blue-50)', color: 'var(--pm-blue-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Map size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {trip.route_label}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>
                      <Link href={`/vehicles/${trip.vehicle_id}`} style={{ fontWeight: 500 }}>
                        {trip.vehicle?.plate_number}
                      </Link>
                      {' • '}{trip.driver?.full_name}
                    </div>
                  </div>
                </div>
                <span className={`pm-badge pm-badge-${trip.status}`}>
                  {trip.status === 'in_progress' ? (
                    <><Clock size={12} /> In progress</>
                  ) : trip.status === 'completed' ? (
                    <><CheckCircle2 size={12} /> Completed</>
                  ) : (
                    trip.status
                  )}
                </span>
              </div>

              <div style={{
                display: 'flex', gap: 'var(--pm-space-6)', marginTop: 12,
                fontSize: '0.8125rem', color: 'var(--pm-text-secondary)',
              }}>
                <div>
                  <span style={{ color: 'var(--pm-text-muted)' }}>Start: </span>
                  {new Date(trip.started_at).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {trip.ended_at && (
                  <div>
                    <span style={{ color: 'var(--pm-text-muted)' }}>End: </span>
                    {new Date(trip.ended_at).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {duration && (
                  <div>
                    <span style={{ color: 'var(--pm-text-muted)' }}>Duration: </span>
                    {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}
                  </div>
                )}
                {distance && (
                  <div>
                    <span style={{ color: 'var(--pm-text-muted)' }}>Distance: </span>
                    {distance} km
                  </div>
                )}
              </div>

              {trip.notes && (
                <div style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>
                  {trip.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><Map size={24} /></div>
          <div className="pm-empty-title">No trips found</div>
          <div className="pm-empty-desc">Log your first trip to track routes and distances.</div>
        </div>
      )}

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>Log Trip</h3>
              <button className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-form-group">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Vehicle</label>
                    <select className="pm-select">
                      <option value="">Select vehicle</option>
                      {mockVehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                    </select>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Driver</label>
                    <select className="pm-select">
                      <option value="">Select driver</option>
                      {mockDrivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pm-input-group">
                  <label className="pm-label">Route</label>
                  <input type="text" className="pm-input" placeholder="e.g. Kasoa to Accra" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Start Odometer (km)</label>
                    <input type="number" className="pm-input" placeholder="0" />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">End Odometer (km)</label>
                    <input type="number" className="pm-input" placeholder="0" />
                  </div>
                </div>
                <div className="pm-input-group">
                  <label className="pm-label">Notes (optional)</label>
                  <textarea className="pm-textarea" placeholder="Any notes about this trip" rows={2} />
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <button className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(false)}>Log Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
