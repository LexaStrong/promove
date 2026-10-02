'use client';

import React, { useState } from 'react';
import { Plus, Fuel, Search } from 'lucide-react';
import { formatPesewas } from '@/lib/types';
import { mockFuelLogs, mockVehicles, mockDrivers } from '@/lib/mock-data';

export default function FuelPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = mockFuelLogs.filter(f => {
    if (!search) return true;
    return `${f.vehicle?.plate_number} ${f.driver?.full_name} ${f.station || ''}`
      .toLowerCase().includes(search.toLowerCase());
  });

  const totalLitres = filtered.reduce((s, f) => s + f.litres, 0);
  const totalCost = filtered.reduce((s, f) => s + f.amount_pesewas, 0);
  const avgPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Fuel Log</h1>
          <p className="pm-page-subtitle">Track fuel consumption across your fleet</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Log Fuel
        </button>
      </div>

      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Litres</div>
          <div className="pm-stat-value">{totalLitres.toFixed(0)} L</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Cost</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalCost)}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Avg per Litre</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(Math.round(avgPerLitre))}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Entries</div>
          <div className="pm-stat-value">{filtered.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--pm-space-4)', maxWidth: 320, position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--pm-text-muted)', pointerEvents: 'none',
        }} />
        <input type="text" className="pm-input" placeholder="Search by vehicle, driver, station..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      <div className="pm-table-wrapper">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th style={{ textAlign: 'right' }}>Litres</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Per Litre</th>
              <th style={{ textAlign: 'right' }}>Odometer</th>
              <th>Station</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td>{f.filled_on}</td>
                <td style={{ fontWeight: 500 }}>{f.vehicle?.plate_number}</td>
                <td>{f.driver?.full_name || '-'}</td>
                <td style={{ textAlign: 'right' }}>{f.litres} L</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }} className="pm-text-money">
                  {formatPesewas(f.amount_pesewas)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--pm-text-secondary)' }} className="pm-text-money">
                  {formatPesewas(Math.round(f.amount_pesewas / f.litres))}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--pm-text-secondary)' }}>
                  {f.odometer_km ? `${f.odometer_km.toLocaleString()} km` : '-'}
                </td>
                <td style={{ color: 'var(--pm-text-secondary)' }}>{f.station || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><Fuel size={24} /></div>
          <div className="pm-empty-title">No fuel logs found</div>
          <div className="pm-empty-desc">Log your first fuel entry to start tracking consumption.</div>
        </div>
      )}

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>Log Fuel</h3>
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
                  <label className="pm-label">Date</label>
                  <input type="date" className="pm-input" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Litres</label>
                    <input type="number" className="pm-input" placeholder="0" step="0.1" />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Amount (GH₵)</label>
                    <input type="number" className="pm-input" placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Odometer (km)</label>
                    <input type="number" className="pm-input" placeholder="Current reading" />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Station</label>
                    <input type="text" className="pm-input" placeholder="e.g. Shell Kaneshie" />
                  </div>
                </div>
              </div>
            </div>
            <div className="pm-modal-footer">
              <button className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(false)}>Log Fuel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
