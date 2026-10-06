'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Car, User, Fuel, Wrench, FileText, BookOpen,
  AlertTriangle, MapPin, Calendar, Clock, Edit, Archive,
  Radio, History, Check, Navigation, ExternalLink, Maximize2, Minimize2,
} from 'lucide-react';
import { formatPesewas, Vehicle, VehicleType, FuelType, VehicleStatus } from '@/lib/types';
import {
  mockVehicles, mockDrivers, mockAssignments, mockLedgerEntries,
  mockDocuments, mockMaintenanceSchedules, mockMaintenanceRecords,
  mockIncidents, mockFuelLogs,
} from '@/lib/mock-data';
import { useFleet } from '@/lib/fleet-context';
import { fleetPositions, getVehicleGpsPosition } from '@/lib/gps/fleet-positions';
import type { VehicleMarkerData } from '@/components/map/tracking-map';
import { getCuratedMakes, getCuratedModels } from '@/lib/vehicle-catalog';

// Dynamically import Leaflet Map for SSR compatibility in Next.js
const TrackingMap = dynamic(() => import('@/components/map/tracking-map'), {
  ssr: false,
  loading: () => (
    <div
      id="divMap"
      style={{
        height: '380px',
        position: 'relative',
        outlineStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F2633',
        color: '#A1D0E0',
        borderRadius: 'var(--pm-radius-lg)',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 14,
            height: 14,
            border: '2px solid #3A96B5',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span>Loading Live Vehicle Location Map...</span>
      </div>
    </div>
  ),
});

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = String(params.id || '');
  const cleanId = rawId.replace(/[-\s]/g, '').toLowerCase();

  const {
    vehicles,
    drivers,
    ledgerEntries,
    maintenanceSchedules,
    maintenanceRecords,
    documents,
    incidents,
    fuelLogs,
    updateVehicle,
    isDemo,
    mounted,
  } = useFleet();

  const foundVehicle =
    vehicles.find(
      v =>
        v.id.toLowerCase() === rawId.toLowerCase() ||
        v.plate_number.replace(/[-\s]/g, '').toLowerCase() === cleanId
    ) || (isDemo ? mockVehicles.find(
      v =>
        v.id.toLowerCase() === rawId.toLowerCase() ||
        v.plate_number.replace(/[-\s]/g, '').toLowerCase() === cleanId
    ) : null);

  const vehicle = foundVehicle;
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: 2024,
    vehicle_type: 'trotro' as VehicleType,
    fuel_type: 'diesel' as FuelType,
    status: 'active' as VehicleStatus,
    seats: 15,
    colour: 'White',
    odometer_km: 0,
    daily_target_pesewas: 35000,
    gps_device_id: '',
  });

  useEffect(() => {
    if (vehicle) {
      setEditForm({
        plate_number: vehicle.plate_number || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || 2024,
        vehicle_type: (vehicle.vehicle_type || 'trotro') as VehicleType,
        fuel_type: (vehicle.fuel_type || 'diesel') as FuelType,
        status: (vehicle.status || 'active') as VehicleStatus,
        seats: vehicle.seats || 15,
        colour: vehicle.colour || 'White',
        odometer_km: vehicle.odometer_km || 0,
        daily_target_pesewas: vehicle.daily_target_pesewas || 35000,
        gps_device_id: vehicle.gps_device_id || '',
      });
    }
  }, [vehicle]);

  if (!mounted) {
    return (
      <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center', color: 'var(--pm-text-muted)' }}>
        Loading vehicle details...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ padding: 'var(--pm-space-6)', maxWidth: 540, margin: '40px auto' }}>
        <div className="pm-card" style={{ padding: 'var(--pm-space-8)', textAlign: 'center' }}>
          <Car size={48} style={{ color: 'var(--pm-text-muted)', marginBottom: 'var(--pm-space-4)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--pm-space-2)' }}>Vehicle Not Found</h2>
          <p style={{ color: 'var(--pm-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--pm-space-5)' }}>
            No vehicle with registration plate &quot;{rawId}&quot; exists in your fleet registry.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/vehicles" className="pm-btn pm-btn-secondary">
              <ArrowLeft size={16} /> Back to Vehicles
            </Link>
            <Link href="/vehicles" className="pm-btn pm-btn-primary">
              Register New Vehicle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const assignment = vehicle.assignment || (isDemo ? mockAssignments.find(a => a.vehicle_id === vehicle.id && !a.ends_at) : null);
  const pastAssignments = isDemo ? mockAssignments.filter(a => a.vehicle_id === vehicle.id && a.ends_at) : [];
  const driver = vehicle.current_driver || (assignment ? (drivers.find(d => d.id === assignment.driver_id) || (isDemo ? mockDrivers.find(d => d.id === assignment.driver_id) : null)) : null);
  const vehicleLedger = ledgerEntries.filter(e => e.vehicle_id === vehicle.id && e.status === 'confirmed');
  const vehicleDocs = documents.filter(d => d.vehicle_id === vehicle.id);
  const vehicleMaintSchedules = maintenanceSchedules.filter(m => m.vehicle_id === vehicle.id);
  const vehicleMaintRecords = maintenanceRecords.filter(m => m.vehicle_id === vehicle.id);
  const vehicleIncidents = incidents.filter(i => i.vehicle_id === vehicle.id);
  const vehicleFuel = fuelLogs.filter(f => f.vehicle_id === vehicle.id);

  const totalIncome = vehicleLedger.filter(e => e.entry_type === 'income').reduce((s, e) => s + e.amount_pesewas, 0);
  const totalExpenses = vehicleLedger.filter(e => e.entry_type === 'expense').reduce((s, e) => s + e.amount_pesewas, 0);

  // Retrieve vehicle live GPS telemetry
  const gpsPos = getVehicleGpsPosition(vehicle.id);

  const currentVehicleMarker: VehicleMarkerData = {
    id: `marker-${vehicle.id}`,
    vehicleId: vehicle.id,
    plateNumber: vehicle.plate_number,
    label: `${vehicle.plate_number} • LOC`,
    driverName: driver ? driver.full_name : (isDemo ? gpsPos.driverName : 'Unassigned'),
    status: vehicle.gps_device_id ? (isDemo ? gpsPos.status : 'moving') : 'idle',
    speedKmh: vehicle.gps_device_id ? (isDemo ? gpsPos.speedKmh : 38) : 0,
    courseHeading: gpsPos.courseHeading,
    latitude: gpsPos.latitude,
    longitude: gpsPos.longitude,
    batteryPercentage: 96,
    ignition: !!vehicle.gps_device_id,
    imei: vehicle.gps_device_id || (isDemo ? gpsPos.imei : 'NO-DEVICE'),
    locationLabel: gpsPos.locationLabel,
  };

  // Build full corridor fleet markers so every vehicle is framed inside map bounds
  const corridorFleetMarkers: VehicleMarkerData[] = isDemo
    ? fleetPositions.map(pos => {
        const isCurrent = pos.vehicleId === vehicle.id;
        return {
          id: `marker-${pos.vehicleId}`,
          vehicleId: pos.vehicleId,
          plateNumber: pos.plateNumber,
          label: isCurrent ? `${pos.plateNumber} • LOC (SELECTED)` : `${pos.plateNumber} • LOC`,
          driverName: isCurrent && driver ? driver.full_name : pos.driverName,
          status: pos.status,
          speedKmh: pos.speedKmh,
          courseHeading: pos.courseHeading,
          latitude: pos.latitude,
          longitude: pos.longitude,
          batteryPercentage: pos.batteryPercentage,
          ignition: pos.ignition,
          imei: isCurrent && vehicle.gps_device_id ? vehicle.gps_device_id : pos.imei,
          locationLabel: pos.locationLabel,
        };
      })
    : (vehicle.gps_device_id ? [currentVehicleMarker] : []);

  if (isDemo && !corridorFleetMarkers.some(m => m.vehicleId === vehicle.id)) {
    corridorFleetMarkers.unshift(currentVehicleMarker);
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(vehicle.id, {
      plate_number: editForm.plate_number.toUpperCase(),
      make: editForm.make,
      model: editForm.model,
      year: Number(editForm.year),
      vehicle_type: editForm.vehicle_type,
      fuel_type: editForm.fuel_type,
      status: editForm.status,
      seats: Number(editForm.seats),
      colour: editForm.colour,
      odometer_km: Number(editForm.odometer_km),
      daily_target_pesewas: Number(editForm.daily_target_pesewas),
      gps_device_id: editForm.gps_device_id.trim() || null,
    });
    setShowEditModal(false);
  };

  const handleToggleArchive = () => {
    const isNowArchived = !vehicle.archived_at;
    updateVehicle(vehicle.id, {
      archived_at: isNowArchived ? new Date().toISOString() : null,
      status: (isNowArchived ? 'unavailable' : 'active') as VehicleStatus,
    });
    setShowEditModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--pm-space-6)' }}>
        <Link
          href="/vehicles"
          className="pm-btn pm-btn-ghost pm-btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 'var(--pm-space-3)',
            padding: '6px 14px',
            borderRadius: 'var(--pm-radius-md)',
            fontWeight: 500,
            border: '1px solid var(--pm-border)',
            background: 'var(--pm-surface)',
          }}
        >
          <ArrowLeft size={15} /> Back to Vehicles
        </Link>

        <div className="pm-page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="pm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {vehicle.plate_number}
              <span className={`pm-badge pm-badge-${vehicle.status}`}>{vehicle.status}</span>
            </h1>
            <p className="pm-page-subtitle">
              {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.vehicle_type}
              {vehicle.colour ? ` • ${vehicle.colour}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--pm-space-3)' }}>
            {vehicle.archived_at && (
              <span className="pm-badge pm-badge-voided" style={{ padding: '6px 12px' }}>
                Archived Vehicle
              </span>
            )}
            <button className="pm-btn pm-btn-secondary" onClick={() => setShowEditModal(true)}>
              <Edit size={16} /> Edit Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Info cards row */}
      <div className="pm-grid-stats" style={{ marginBottom: 'var(--pm-space-5)' }}>
        {/* Money ledger / revenue cards commented out per requirement */}
        {/*
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Income</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalIncome)}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Expenses</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalExpenses)}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Net Profit</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(totalIncome - totalExpenses)}</div>
        </div>
        */}
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Odometer</div>
          <div className="pm-stat-value">{vehicle.odometer_km.toLocaleString()} km</div>
        </div>
      </div>

      {/* Dedicated Vehicle Live GPS Location & Map */}
      <div className="pm-card" style={{ marginBottom: 'var(--pm-space-5)', overflow: 'hidden' }}>
        <div style={{
          padding: 'var(--pm-space-4) var(--pm-space-5)',
          borderBottom: '1px solid var(--pm-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              <Navigation size={18} color="var(--pm-blue-600)" /> Live GPS Location & Corridor Tracking
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} />
              <span>Current corridor: <strong>{gpsPos.locationLabel}</strong></span>
              <span>•</span>
              <span style={{ fontFamily: 'monospace' }}>Lat: {gpsPos.latitude.toFixed(4)}, Lng: {gpsPos.longitude.toFixed(4)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              className={`pm-badge ${
                gpsPos.status === 'moving'
                  ? 'pm-badge-success'
                  : gpsPos.status === 'idle'
                  ? 'pm-badge-pending'
                  : 'pm-badge-neutral'
              }`}
              style={{ textTransform: 'capitalize' }}
            >
              {gpsPos.status} {gpsPos.status === 'moving' && `${gpsPos.speedKmh} km/h`}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>
              Ignition: <strong>{gpsPos.ignition ? 'ON' : 'OFF'}</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>
              Battery: <strong>{gpsPos.batteryPercentage}%</strong>
            </span>
            <button
              type="button"
              className="pm-btn pm-btn-secondary pm-btn-xs"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {isMapExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              <span>{isMapExpanded ? 'Collapse' : 'Expand Map'}</span>
            </button>
            <Link
              href="/live-map"
              className="pm-btn pm-btn-ghost pm-btn-xs"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--pm-blue-600)' }}
            >
              <span>Full Fleet Map</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Live Leaflet Map Container with id="divMap" */}
        <div style={{ height: isMapExpanded ? '600px' : '400px', position: 'relative' }}>
          <TrackingMap
            vehicles={corridorFleetMarkers}
            selectedVehicleId={vehicle.id}
            singleVehicleMode={false}
            fitFleetOnLoad={true}
            mapHeight={isMapExpanded ? '600px' : '400px'}
            showTrail={true}
            showGeofences={true}
            isExpanded={isMapExpanded}
            onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
            onVehicleClick={(veh) => {
              const targetId = veh.vehicleId || veh.id.replace('marker-', '');
              if (targetId && targetId !== vehicle.id) {
                router.push(`/vehicles/${targetId}`);
              }
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--pm-space-4)' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          {/* Current Assignment */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} /> Current Assignment
              </h3>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              {driver ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="pm-topbar-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                    {driver.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                      <Link href={`/drivers/${driver.id}`}>{driver.full_name}</Link>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>
                      {driver.role_type} • {driver.phone}
                    </div>
                    {assignment && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', marginTop: 4 }}>
                        {/* Target & commission commented out per requirement */}
                        {/* Commission: {assignment.commission_type === 'percent'
                          ? `${assignment.commission_value}%`
                          : assignment.commission_type === 'fixed'
                          ? formatPesewas(assignment.commission_value)
                          : 'None'} • Target: {formatPesewas(assignment.daily_sales_target_pesewas ?? 0)}/day */}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pm-empty" style={{ padding: 'var(--pm-space-4)' }}>
                  <p style={{ margin: 0, color: 'var(--pm-text-muted)', fontSize: '0.875rem' }}>
                    No driver currently assigned to this vehicle.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Income & Expenses - commented out per requirement */}
          {/*
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} /> Recent Ledger Entries
              </h3>
              <Link href="/ledger" className="pm-btn pm-btn-ghost pm-btn-sm">
                View all
              </Link>
            </div>
            {vehicleLedger.length === 0 ? (
              <div className="pm-empty" style={{ padding: 'var(--pm-space-6)' }}>
                <p style={{ margin: 0, color: 'var(--pm-text-muted)' }}>No ledger entries recorded for this vehicle.</p>
              </div>
            ) : (
              <div className="pm-table-container">
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleLedger.slice(0, 5).map(e => (
                      <tr key={e.id}>
                        <td>{e.entry_date}</td>
                        <td>
                          <span className={`pm-badge ${e.entry_type === 'income' ? 'pm-badge-success' : 'pm-badge-voided'}`}>
                            {e.entry_type}
                          </span>
                        </td>
                        <td>{e.category.replace('_', ' ')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {e.entry_type === 'expense' ? '-' : '+'}{formatPesewas(e.amount_pesewas)}
                        </td>
                        <td>
                          <span className="pm-badge pm-badge-active">{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          */}

          {/* Maintenance Records */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={18} /> Maintenance History
              </h3>
              <Link href="/maintenance" className="pm-btn pm-btn-ghost pm-btn-sm">
                View all
              </Link>
            </div>
            {vehicleMaintRecords.length === 0 ? (
              <div className="pm-empty" style={{ padding: 'var(--pm-space-6)' }}>
                <p style={{ margin: 0, color: 'var(--pm-text-muted)' }}>No maintenance records found.</p>
              </div>
            ) : (
              <div className="pm-table-container">
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Cost</th>
                      <th>Odometer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleMaintRecords.map(m => (
                      <tr key={m.id}>
                        <td>{m.performed_on}</td>
                        <td>{m.description}</td>
                        <td style={{ fontWeight: 600 }}>{formatPesewas(m.cost_pesewas ?? 0)}</td>
                        <td>{m.odometer_km?.toLocaleString()} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          {/* Vehicle Details Card */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Car size={18} /> Specifications
              </h3>
            </div>
            <div style={{ padding: 'var(--pm-space-5)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Daily target commented out per requirement */}
              {/*
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>Daily Target</span>
                <span style={{ fontWeight: 600 }}>{formatPesewas(vehicle.daily_target_pesewas ?? 0)}</span>
              </div>
              */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>Seating Capacity</span>
                <span style={{ fontWeight: 500 }}>{vehicle.seats} passengers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>Fuel Type</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{vehicle.fuel_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>Colour</span>
                <span style={{ fontWeight: 500 }}>{vehicle.colour || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>VIN / Chassis</span>
                <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {vehicle.vin || 'Not registered'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>GPS Tracker IMEI</span>
                <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--pm-blue-600)' }}>
                  {vehicle.gps_device_id || gpsPos.imei}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Documents */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} /> Compliance Documents
              </h3>
              <Link href="/documents" className="pm-btn pm-btn-ghost pm-btn-sm">
                Manage
              </Link>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              {vehicleDocs.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--pm-text-muted)', fontSize: '0.8125rem' }}>
                  No statutory documents uploaded.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {vehicleDocs.map(doc => {
                    const isExpired = (doc.days_until_expiry ?? 999) <= 0;
                    return (
                      <div key={doc.id} style={{
                        padding: 8, borderRadius: 'var(--pm-radius-md)',
                        background: 'var(--pm-bg-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{doc.doc_type.replace('_', ' ')}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>Expires: {doc.expires_on || 'No expiry'}</div>
                        </div>
                        <span className={`pm-badge ${isExpired ? 'pm-badge-voided' : 'pm-badge-active'}`}>
                          {isExpired ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Incidents & Faults
              </h3>
              <Link href="/incidents" className="pm-btn pm-btn-ghost pm-btn-sm">
                View all
              </Link>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              {vehicleIncidents.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--pm-text-muted)', fontSize: '0.8125rem' }}>
                  No incidents reported for this vehicle.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {vehicleIncidents.map(inc => (
                    <div key={inc.id} style={{
                      padding: 8, borderRadius: 'var(--pm-radius-md)',
                      background: 'var(--pm-error-light)',
                      border: '1px solid rgba(196,67,67,0.2)',
                    }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pm-error)' }}>
                        {inc.incident_type} • {inc.severity}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                        {inc.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <div className="pm-modal-overlay">
          <div className="pm-modal" style={{ maxWidth: 540 }}>
            <div className="pm-modal-header">
              <h2>Edit Vehicle: {vehicle.plate_number}</h2>
              <button
                type="button"
                className="pm-btn pm-btn-ghost pm-btn-sm"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="pm-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Registration Number (Plate) *</label>
                    <input
                      type="text"
                      className="pm-input"
                      value={editForm.plate_number}
                      onChange={e => setEditForm({ ...editForm, plate_number: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Vehicle Type</label>
                      <select
                        className="pm-select"
                        value={editForm.vehicle_type}
                        onChange={e => {
                          const newType = e.target.value as VehicleType;
                          const makes = getCuratedMakes(newType);
                          const newMake = makes[0] || 'Other';
                          const models = getCuratedModels(newMake, newType);
                          setEditForm({
                            ...editForm,
                            vehicle_type: newType,
                            make: newMake,
                            model: models[0] || '',
                          });
                        }}
                      >
                        <option value="trotro">Trotro</option>
                        <option value="taxi">Taxi</option>
                        <option value="bus">Bus</option>
                        <option value="truck">Truck</option>
                        <option value="pickup">Pickup</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Year</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={editForm.year}
                        onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value, 10) || 2024 })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Make *</label>
                      {(() => {
                        const curatedMakes = getCuratedMakes(editForm.vehicle_type);
                        const isCurated = curatedMakes.includes(editForm.make);
                        const selectVal = isCurated ? editForm.make : 'Other';

                        return (
                          <>
                            <select
                              className="pm-select"
                              value={selectVal}
                              onChange={e => {
                                const newMake = e.target.value;
                                if (newMake === 'Other') {
                                  setEditForm({ ...editForm, make: 'Other', model: 'Other' });
                                } else {
                                  const models = getCuratedModels(newMake, editForm.vehicle_type);
                                  setEditForm({
                                    ...editForm,
                                    make: newMake,
                                    model: models[0] || '',
                                  });
                                }
                              }}
                            >
                              {curatedMakes.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                              <option value="Other">Other / Custom Make...</option>
                            </select>
                            {selectVal === 'Other' && (
                              <input
                                type="text"
                                className="pm-input"
                                style={{ marginTop: 6 }}
                                placeholder="Enter custom make..."
                                value={editForm.make === 'Other' ? '' : editForm.make}
                                onChange={e => setEditForm({ ...editForm, make: e.target.value })}
                                required
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Model *</label>
                      {(() => {
                        const curatedModels = getCuratedModels(editForm.make, editForm.vehicle_type);
                        const exactMatch = curatedModels.find(m => m === editForm.model);
                        const fuzzyMatch = !exactMatch && editForm.model && editForm.model !== 'Other'
                          ? curatedModels.find(m => m.toLowerCase().startsWith(editForm.model.toLowerCase()) || m.toLowerCase().includes(editForm.model.toLowerCase()))
                          : null;
                        const matchedModel = exactMatch || fuzzyMatch;
                        const selectVal = matchedModel ? matchedModel : 'Other';

                        return (
                          <>
                            {curatedModels.length > 0 ? (
                              <select
                                className="pm-select"
                                value={selectVal}
                                onChange={e => {
                                  if (e.target.value === 'Other') {
                                    setEditForm({ ...editForm, model: 'Other' });
                                  } else {
                                    setEditForm({ ...editForm, model: e.target.value });
                                  }
                                }}
                              >
                                {curatedModels.map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                                <option value="Other">Other / Custom Model...</option>
                              </select>
                            ) : null}

                            {(curatedModels.length === 0 || selectVal === 'Other') && (
                              <input
                                type="text"
                                className="pm-input"
                                style={{ marginTop: curatedModels.length > 0 ? 6 : 0 }}
                                placeholder="Enter model name..."
                                value={editForm.model === 'Other' ? '' : editForm.model}
                                onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                                required
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Fuel Type</label>
                      <select
                        className="pm-select"
                        value={editForm.fuel_type}
                        onChange={e => setEditForm({ ...editForm, fuel_type: e.target.value as FuelType })}
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
                        value={editForm.seats}
                        onChange={e => setEditForm({ ...editForm, seats: parseInt(e.target.value, 10) || 15 })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Odometer (km)</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={editForm.odometer_km}
                        onChange={e => setEditForm({ ...editForm, odometer_km: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    {/* Daily target input commented out per requirement */}
                    {/*
                    <div className="pm-input-group">
                      <label className="pm-label">Daily Target (GH₵)</label>
                      <input
                        type="number"
                        className="pm-input"
                        value={editForm.daily_target_pesewas / 100}
                        onChange={e => setEditForm({ ...editForm, daily_target_pesewas: (parseFloat(e.target.value) || 0) * 100 })}
                      />
                    </div>
                    */}
                  </div>

                  {/* GPS Device Field */}
                  <div className="pm-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="pm-label" style={{ marginBottom: 0 }}>GPS Device IMEI / ID</label>
                      <span className="pm-badge pm-badge-success" style={{ fontSize: '0.6875rem' }}>
                        Traccar Hardware Online
                      </span>
                    </div>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="e.g. 864201049281700"
                      value={editForm.gps_device_id}
                      onChange={e => setEditForm({ ...editForm, gps_device_id: e.target.value })}
                    />
                  </div>

                  {/* Archive vehicle option */}
                  <div style={{
                    marginTop: 'var(--pm-space-2)',
                    padding: 'var(--pm-space-3) var(--pm-space-4)',
                    background: 'var(--pm-bg-subtle)',
                    borderRadius: 'var(--pm-radius-md)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                        {vehicle.archived_at ? 'Restore Vehicle' : 'Archive Vehicle'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                        {vehicle.archived_at ? 'Make this vehicle active again in registry' : 'Remove from active fleet without deleting financial history'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`pm-btn pm-btn-sm ${vehicle.archived_at ? 'pm-btn-secondary' : 'pm-btn-ghost'}`}
                      style={{ color: vehicle.archived_at ? 'var(--pm-success)' : 'var(--pm-error)' }}
                      onClick={handleToggleArchive}
                    >
                      <Archive size={14} /> {vehicle.archived_at ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
