'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Car, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { mockVehicles } from '@/lib/mock-data';
import { Vehicle, VehicleStatus, VehicleType, FuelType } from '@/lib/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: 2026,
    vehicle_type: 'trotro' as VehicleType,
    fuel_type: 'diesel' as FuelType,
    seats: 15,
    colour: 'White',
    odometer_km: 0,
    daily_target: 350,
  });

  // Bulk add state
  const [bulkInput, setBulkInput] = useState(
    'GR 4512-24, Toyota, HiAce, 2023, trotro, 15, diesel, 42000\n' +
    'GW 8192-23, Nissan, Urvan, 2022, trotro, 15, diesel, 68000\n' +
    'GS 1044-24, Hyundai, Elantra, 2021, taxi, 4, petrol, 51000\n' +
    'INVALID_ROW, NoModel, , 1800, rocket, -5, water, -100'
  );

  interface ParsedRow {
    rowNumber: number;
    plate: string;
    make: string;
    model: string;
    year: number;
    type: VehicleType;
    seats: number;
    fuel: FuelType;
    odometer: number;
    errors: string[];
    isValid: boolean;
  }

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleParseBulk = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const validVehicleTypes: VehicleType[] = ['trotro', 'taxi', 'bus', 'truck', 'pickup', 'other'];
    const validFuelTypes: FuelType[] = ['diesel', 'petrol', 'lpg', 'electric'];

    const results: ParsedRow[] = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      const errors: string[] = [];

      const plate = parts[0] || '';
      const make = parts[1] || '';
      const model = parts[2] || '';
      const year = parseInt(parts[3] || '0', 10);
      const rawType = (parts[4] || '').toLowerCase() as VehicleType;
      const seats = parseInt(parts[5] || '0', 10);
      const rawFuel = (parts[6] || '').toLowerCase() as FuelType;
      const odometer = parseInt(parts[7] || '0', 10);

      if (!plate || plate.length < 5) errors.push('Invalid plate number');
      if (!make) errors.push('Missing make');
      if (!model) errors.push('Missing model');
      if (isNaN(year) || year < 1990 || year > 2026) errors.push('Year must be between 1990 and 2026');
      if (!validVehicleTypes.includes(rawType)) errors.push(`Invalid vehicle type: ${parts[4] || 'empty'}`);
      if (isNaN(seats) || seats <= 0) errors.push('Seats must be greater than 0');
      if (!validFuelTypes.includes(rawFuel)) errors.push(`Invalid fuel type: ${parts[6] || 'empty'}`);
      if (isNaN(odometer) || odometer < 0) errors.push('Odometer cannot be negative');

      return {
        rowNumber: idx + 1,
        plate,
        make,
        model,
        year,
        type: validVehicleTypes.includes(rawType) ? rawType : 'other',
        seats: isNaN(seats) ? 4 : seats,
        fuel: validFuelTypes.includes(rawFuel) ? rawFuel : 'diesel',
        odometer: isNaN(odometer) ? 0 : odometer,
        errors,
        isValid: errors.length === 0,
      };
    });

    setParsedRows(results);
    setHasParsed(true);
  };

  const handleImportValid = () => {
    const validOnes = parsedRows.filter(r => r.isValid);
    if (validOnes.length === 0) return;

    const newVehiclesList: Vehicle[] = validOnes.map(r => ({
      id: `veh-${Date.now()}-${r.rowNumber}`,
      org_id: 'org-demo',
      plate_number: r.plate,
      make: r.make,
      model: r.model,
      year: r.year,
      vehicle_type: r.type,
      colour: 'White',
      vin: null,
      seats: r.seats,
      fuel_type: r.fuel,
      status: 'active',
      odometer_km: r.odometer,
      daily_target_pesewas: 35000,
      gps_device_id: null,
      archived_at: null,
      created_at: new Date().toISOString(),
    }));

    setVehicles(prev => [...newVehiclesList, ...prev]);
    setShowBulkModal(false);
    setHasParsed(false);
    setParsedRows([]);
  };

  const handleAddSingleVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.plate_number || !newVehicle.make || !newVehicle.model) return;

    const created: Vehicle = {
      id: `veh-${Date.now()}`,
      org_id: 'org-demo',
      plate_number: newVehicle.plate_number.toUpperCase(),
      make: newVehicle.make,
      model: newVehicle.model,
      year: Number(newVehicle.year),
      vehicle_type: newVehicle.vehicle_type,
      colour: newVehicle.colour,
      vin: null,
      seats: Number(newVehicle.seats),
      fuel_type: newVehicle.fuel_type,
      status: 'active',
      odometer_km: Number(newVehicle.odometer_km),
      daily_target_pesewas: Number(newVehicle.daily_target) * 100,
      gps_device_id: null,
      archived_at: null,
      created_at: new Date().toISOString(),
    };

    setVehicles(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewVehicle({
      plate_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vehicle_type: 'trotro',
      fuel_type: 'diesel',
      seats: 15,
      colour: 'White',
      odometer_km: 0,
      daily_target: 350,
    });
  };

  const filtered = vehicles.filter(v => {
    if (v.archived_at) return false;
    if (search && !`${v.plate_number} ${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    if (typeFilter && v.vehicle_type !== typeFilter) return false;
    return true;
  });

  const statusCounts = {
    all: vehicles.filter(v => !v.archived_at).length,
    active: vehicles.filter(v => v.status === 'active').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    unavailable: vehicles.filter(v => v.status === 'unavailable').length,
  };

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Vehicles</h1>
          <p className="pm-page-subtitle">{statusCounts.all} vehicles in your fleet</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--pm-space-3)' }}>
          <button className="pm-btn pm-btn-secondary" onClick={() => { setShowBulkModal(true); setHasParsed(false); }}>
            <Upload size={16} /> Bulk Add
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="pm-tabs">
        {[
          { key: '', label: 'All', count: statusCounts.all },
          { key: 'active', label: 'Active', count: statusCounts.active },
          { key: 'idle', label: 'Idle', count: statusCounts.idle },
          { key: 'maintenance', label: 'Maintenance', count: statusCounts.maintenance },
          { key: 'unavailable', label: 'Unavailable', count: statusCounts.unavailable },
        ].map(tab => (
          <button
            key={tab.key}
            className={`pm-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key as VehicleStatus | '')}
          >
            {tab.label}
            <span style={{
              marginLeft: 6, fontSize: '0.6875rem', background: 'var(--pm-bg-muted)',
              padding: '1px 8px', borderRadius: 'var(--pm-radius-full)',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--pm-space-3)', marginBottom: 'var(--pm-space-4)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--pm-text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            className="pm-input"
            placeholder="Search by plate, make, model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          className="pm-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as VehicleType | '')}
          style={{ width: 160 }}
        >
          <option value="">All types</option>
          <option value="trotro">Trotro</option>
          <option value="taxi">Taxi</option>
          <option value="bus">Bus</option>
          <option value="truck">Truck</option>
          <option value="pickup">Pickup</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="pm-table-wrapper">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Assigned Driver</th>
              <th>Status</th>
              <th>Fuel</th>
              <th style={{ textAlign: 'right' }}>Odometer</th>
              <th style={{ textAlign: 'right' }}>Daily Target</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id}>
                <td>
                  <Link href={`/vehicles/${v.id}`} style={{ fontWeight: 600 }}>
                    {v.plate_number}
                  </Link>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.make} {v.model}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{v.year}</div>
                </td>
                <td>
                  <span style={{
                    textTransform: 'capitalize', fontSize: '0.8125rem',
                    color: 'var(--pm-text-secondary)',
                  }}>
                    {v.vehicle_type}
                  </span>
                </td>
                <td>
                  {v.current_driver ? (
                    <Link href={`/drivers/${v.current_driver.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span className="pm-topbar-avatar" style={{ width: 28, height: 28, fontSize: '0.6875rem' }}>
                        {v.current_driver.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                      <span style={{ fontSize: '0.875rem' }}>{v.current_driver.full_name}</span>
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--pm-text-muted)', fontSize: '0.8125rem' }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <span className={`pm-badge pm-badge-${v.status}`}>{v.status}</span>
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', textTransform: 'capitalize' }}>
                  {v.fuel_type}
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {v.odometer_km.toLocaleString()} km
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {v.daily_target_pesewas
                    ? `GH₵ ${(v.daily_target_pesewas / 100).toFixed(0)}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><Car size={24} /></div>
          <div className="pm-empty-title">No vehicles found</div>
          <div className="pm-empty-desc">
            {search || statusFilter || typeFilter
              ? 'Try adjusting your filters'
              : 'Add your first vehicle to get started'}
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleAddSingleVehicle}>
              <div className="pm-modal-header">
                <h3>Add Vehicle to Fleet</h3>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="pm-modal-body">
                <div className="pm-form-group">
                  <div className="pm-input-group">
                    <label className="pm-label">Plate Number *</label>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="e.g. GR 1234-24"
                      value={newVehicle.plate_number}
                      onChange={e => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Make *</label>
                      <input
                        type="text"
                        className="pm-input"
                        placeholder="e.g. Toyota"
                        value={newVehicle.make}
                        onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        required
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Model *</label>
                      <input
                        type="text"
                        className="pm-input"
                        placeholder="e.g. HiAce"
                        value={newVehicle.model}
                        onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Year</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={newVehicle.year}
                        onChange={e => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value, 10) || 2024 })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Vehicle Type</label>
                      <select
                        className="pm-select"
                        value={newVehicle.vehicle_type}
                        onChange={e => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value as VehicleType })}
                      >
                        <option value="trotro">Trotro</option>
                        <option value="taxi">Taxi</option>
                        <option value="bus">Bus</option>
                        <option value="truck">Truck</option>
                        <option value="pickup">Pickup</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Fuel Type</label>
                      <select
                        className="pm-select"
                        value={newVehicle.fuel_type}
                        onChange={e => setNewVehicle({ ...newVehicle, fuel_type: e.target.value as FuelType })}
                      >
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="lpg">LPG</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Seats</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={newVehicle.seats}
                        onChange={e => setNewVehicle({ ...newVehicle, seats: parseInt(e.target.value, 10) || 15 })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Colour</label>
                      <input
                        type="text"
                        className="pm-input"
                        value={newVehicle.colour}
                        onChange={e => setNewVehicle({ ...newVehicle, colour: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Odometer (km)</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={newVehicle.odometer_km}
                        onChange={e => setNewVehicle({ ...newVehicle, odometer_km: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Daily Sales Target (GH₵)</label>
                    <input
                      type="number"
                      className="pm-input"
                      value={newVehicle.daily_target}
                      onChange={e => setNewVehicle({ ...newVehicle, daily_target: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Add Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Vehicles Modal */}
      {showBulkModal && (
        <div className="pm-modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 840 }}>
            <div className="pm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={20} style={{ color: 'var(--pm-blue-500)' }} />
                <h3>Bulk Add Vehicles (CSV / Pasted List)</h3>
              </div>
              <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="pm-modal-body">
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginBottom: 8 }}>
                Paste comma-separated vehicle lines below. Format: <code>Plate, Make, Model, Year, Type, Seats, Fuel, Odometer</code>
              </p>

              <textarea
                className="pm-textarea"
                rows={5}
                value={bulkInput}
                onChange={e => { setBulkInput(e.target.value); setHasParsed(false); }}
                placeholder="GR 1234-24, Toyota, HiAce, 2023, trotro, 15, diesel, 45000"
                style={{ fontFamily: 'monospace', fontSize: '0.8125rem', marginBottom: 'var(--pm-space-3)' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--pm-space-4)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                  Accepts Ghana plates (GR, GW, GS, AS, GT, etc.)
                </div>
                <button type="button" className="pm-btn pm-btn-secondary pm-btn-sm" onClick={handleParseBulk}>
                  Validate & Parse Rows
                </button>
              </div>

              {/* Row-Level Error & Validation Preview */}
              {hasParsed && (
                <div>
                  <div style={{
                    display: 'flex', gap: 12, marginBottom: 'var(--pm-space-3)',
                    padding: '8px 12px', background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)',
                    fontSize: '0.8125rem'
                  }}>
                    <span style={{ color: 'var(--pm-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} /> {parsedRows.filter(r => r.isValid).length} Valid
                    </span>
                    <span style={{ color: 'var(--pm-error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={14} /> {parsedRows.filter(r => !r.isValid).length} Errors
                    </span>
                  </div>

                  <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--pm-border)', borderRadius: 'var(--pm-radius-md)' }}>
                    <table className="pm-table" style={{ fontSize: '0.75rem', margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>Row</th>
                          <th>Status</th>
                          <th>Plate</th>
                          <th>Vehicle</th>
                          <th>Type / Fuel</th>
                          <th>Validation Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map(r => (
                          <tr key={r.rowNumber} style={{ background: r.isValid ? 'transparent' : 'var(--pm-error-light)' }}>
                            <td style={{ fontWeight: 600 }}>#{r.rowNumber}</td>
                            <td>
                              {r.isValid ? (
                                <span className="pm-badge pm-badge-confirmed" style={{ fontSize: '0.6875rem' }}>Valid</span>
                              ) : (
                                <span className="pm-badge pm-badge-critical" style={{ fontSize: '0.6875rem' }}>Error</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 600 }}>{r.plate || '-'}</td>
                            <td>{r.make} {r.model} ({r.year || '-'})</td>
                            <td>{r.type} • {r.fuel}</td>
                            <td>
                              {r.isValid ? (
                                <span style={{ color: 'var(--pm-success)' }}>Ready for import</span>
                              ) : (
                                <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--pm-error)' }}>
                                  {r.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="pm-modal-footer">
              <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowBulkModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="pm-btn pm-btn-primary"
                onClick={handleImportValid}
                disabled={!hasParsed || parsedRows.filter(r => r.isValid).length === 0}
              >
                Import {hasParsed ? parsedRows.filter(r => r.isValid).length : 0} Valid Vehicles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
