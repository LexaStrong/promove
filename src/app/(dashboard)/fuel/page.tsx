'use client';

import React, { useState } from 'react';
import { Plus, Fuel, Search } from 'lucide-react';
import { formatPesewas, cedisToPesewas } from '@/lib/types';
import { useFleet } from '@/lib/fleet-context';

export default function FuelPage() {
  const { fuelLogs, vehicles, drivers, addFuelLog } = useFleet();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    filled_on: new Date().toISOString().slice(0, 10),
    litres: '',
    amount_cedis: '',
    odometer_km: '',
    station: '',
  });

  const filtered = fuelLogs.filter(f => {
    if (!search) return true;
    return `${f.vehicle?.plate_number || ''} ${f.driver?.full_name || ''} ${f.station || ''}`
      .toLowerCase().includes(search.toLowerCase());
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id) {
      alert('Please select a vehicle');
      return;
    }
    const litresNum = parseFloat(formData.litres) || 0;
    const amountPesewas = cedisToPesewas(parseFloat(formData.amount_cedis) || 0);
    const odoNum = formData.odometer_km ? parseInt(formData.odometer_km, 10) : null;

    addFuelLog({
      vehicle_id: formData.vehicle_id,
      driver_id: formData.driver_id || null,
      filled_on: formData.filled_on,
      litres: litresNum,
      amount_pesewas: amountPesewas,
      odometer_km: odoNum,
      station: formData.station || null,
    });

    setFormData({
      vehicle_id: '',
      driver_id: '',
      filled_on: new Date().toISOString().slice(0, 10),
      litres: '',
      amount_cedis: '',
      odometer_km: '',
      station: '',
    });
    setShowAddModal(false);
  };

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
            <form onSubmit={handleAddSubmit}>
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
                  <div className="pm-input-group">
                    <label className="pm-label">Date</label>
                    <input
                      type="date"
                      className="pm-input"
                      required
                      value={formData.filled_on}
                      onChange={e => setFormData({ ...formData, filled_on: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Litres</label>
                      <input
                        type="number"
                        className="pm-input"
                        placeholder="0"
                        step="0.1"
                        required
                        value={formData.litres}
                        onChange={e => setFormData({ ...formData, litres: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Amount (GH₵)</label>
                      <input
                        type="number"
                        className="pm-input"
                        placeholder="0.00"
                        step="0.01"
                        required
                        value={formData.amount_cedis}
                        onChange={e => setFormData({ ...formData, amount_cedis: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Odometer (km)</label>
                      <input
                        type="number"
                        className="pm-input"
                        placeholder="Current reading"
                        value={formData.odometer_km}
                        onChange={e => setFormData({ ...formData, odometer_km: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Station</label>
                      <input
                        type="text"
                        className="pm-input"
                        placeholder="e.g. Shell Kaneshie"
                        value={formData.station}
                        onChange={e => setFormData({ ...formData, station: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Log Fuel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
