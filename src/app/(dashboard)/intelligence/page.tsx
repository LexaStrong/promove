'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Fuel,
  Users,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { formatPesewas } from '@/lib/types';
import { mockVehicles, mockDrivers } from '@/lib/mock-data';

interface FuelAnomaly {
  id: string;
  plateNumber: string;
  model: string;
  driverName: string;
  baselineLitresPer100Km: number;
  actualLitresPer100Km: number;
  variancePercentage: number;
  flagType: 'suspected_siphon' | 'engine_inefficiency' | 'normal';
  estimatedLossGhs: number;
  notes: string;
}

interface DriverScorecard {
  id: string;
  driverName: string;
  phone: string;
  vehiclePlate: string;
  speedViolationsCount: number;
  idleTimePercentage: number;
  remittanceConsistencyPercentage: number;
  incidentsReported: number;
  overallScore: number;
  status: 'star' | 'reliable' | 'coaching_required' | 'high_risk';
}

interface MaintenancePrediction {
  id: string;
  vehiclePlate: string;
  component: string;
  currentOdoKm: number;
  projectedDueOdoKm: number;
  dailyAverageKm: number;
  daysRemaining: number;
  estimatedCostPesewas: number;
  urgency: 'critical' | 'upcoming' | 'good';
}

const mockFuelAnomalies: FuelAnomaly[] = [
  {
    id: 'fa-1',
    plateNumber: 'GR-4521-22',
    model: 'Toyota HiAce (Trotro)',
    driverName: 'Kwame Mensah',
    baselineLitresPer100Km: 12.5,
    actualLitresPer100Km: 15.4,
    variancePercentage: 23.2,
    flagType: 'suspected_siphon',
    estimatedLossGhs: 480.0,
    notes: 'Sudden spike of 28 litres logged with only 180 km traveled on the Kasoa corridor.',
  },
  {
    id: 'fa-2',
    plateNumber: 'GT-1892-23',
    model: 'Hyundai H100',
    driverName: 'Kofi Owusu',
    baselineLitresPer100Km: 11.0,
    actualLitresPer100Km: 12.1,
    variancePercentage: 10.0,
    flagType: 'engine_inefficiency',
    estimatedLossGhs: 140.0,
    notes: 'Gradual increase in fuel consumption over 3 weeks. Suggest checking air filter and injector nozzles.',
  },
  {
    id: 'fa-3',
    plateNumber: 'GE-6721-21',
    model: 'Nissan NV350',
    driverName: 'Emmanuel Osei',
    baselineLitresPer100Km: 13.0,
    actualLitresPer100Km: 12.8,
    variancePercentage: -1.5,
    flagType: 'normal',
    estimatedLossGhs: 0,
    notes: 'Fuel efficiency is matching historical manufacturer benchmark.',
  },
];

const mockDriverScorecards: DriverScorecard[] = [
  {
    id: 'dsc-1',
    driverName: 'Kwame Mensah',
    phone: '+233 24 412 3456',
    vehiclePlate: 'GR-4521-22',
    speedViolationsCount: 1,
    idleTimePercentage: 14,
    remittanceConsistencyPercentage: 98,
    incidentsReported: 0,
    overallScore: 94,
    status: 'star',
  },
  {
    id: 'dsc-2',
    driverName: 'Kofi Owusu',
    phone: '+233 20 876 5432',
    vehiclePlate: 'GT-1892-23',
    speedViolationsCount: 4,
    idleTimePercentage: 22,
    remittanceConsistencyPercentage: 92,
    incidentsReported: 0,
    overallScore: 82,
    status: 'reliable',
  },
  {
    id: 'dsc-3',
    driverName: 'Yaw Boateng',
    phone: '+233 27 765 4321',
    vehiclePlate: 'GW-3312-22',
    speedViolationsCount: 9,
    idleTimePercentage: 38,
    remittanceConsistencyPercentage: 74,
    incidentsReported: 1,
    overallScore: 61,
    status: 'coaching_required',
  },
];

const mockPredictions: MaintenancePrediction[] = [
  {
    id: 'mp-1',
    vehiclePlate: 'GR-4521-22',
    component: 'Front Brake Pads & Rotors',
    currentOdoKm: 142800,
    projectedDueOdoKm: 144500,
    dailyAverageKm: 165,
    daysRemaining: 10,
    estimatedCostPesewas: 65000,
    urgency: 'critical',
  },
  {
    id: 'mp-2',
    vehiclePlate: 'GT-1892-23',
    component: 'Engine Oil & Oil Filter (5,000 km)',
    currentOdoKm: 89400,
    projectedDueOdoKm: 91500,
    dailyAverageKm: 140,
    daysRemaining: 15,
    estimatedCostPesewas: 45000,
    urgency: 'upcoming',
  },
  {
    id: 'mp-3',
    vehiclePlate: 'GE-6721-21',
    component: 'Transmission Fluid & Differential Oil',
    currentOdoKm: 112000,
    projectedDueOdoKm: 120000,
    dailyAverageKm: 130,
    daysRemaining: 61,
    estimatedCostPesewas: 85000,
    urgency: 'good',
  },
];

export default function FleetIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'drivers' | 'maintenance'>('fuel');
  const [search, setSearch] = useState('');

  return (
    <div>
      {/* Page Header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={22} color="var(--pm-blue-600)" /> Fleet Intelligence & Telematics AI
          </h1>
          <p className="pm-page-subtitle">
            Phase 3 real-world telemetry analytics: fuel anomaly detection, driver scorecards, and predictive maintenance
          </p>
        </div>
      </div>

      {/* Owner Plain-Language Executive Digest */}
      <div style={{
        background: 'var(--pm-blue-50)',
        border: '1px solid var(--pm-blue-200)',
        borderRadius: 'var(--pm-radius-lg)',
        padding: 'var(--pm-space-5)',
        marginBottom: 'var(--pm-space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 700, color: 'var(--pm-blue-600)' }}>
          <TrendingUp size={18} /> Owner Insights Digest (Plain Language)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--pm-space-4)' }}>
          <div style={{ background: '#FFFFFF', padding: 'var(--pm-space-4)', borderRadius: 'var(--pm-radius-md)', border: '1px solid var(--pm-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pm-error)', textTransform: 'uppercase' }}>
              Suspected Fuel Siphoning Alert
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '4px 0 0 0', lineHeight: 1.5, color: 'var(--pm-text)' }}>
              Vehicle <strong>GR-4521-22</strong> consumed 23% more fuel than baseline this week. We estimate an unrecovered variance of approximately <strong>GH₵ 480.00</strong>.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: 'var(--pm-space-4)', borderRadius: 'var(--pm-radius-md)', border: '1px solid var(--pm-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pm-success)', textTransform: 'uppercase' }}>
              Top Performing Driver
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '4px 0 0 0', lineHeight: 1.5, color: 'var(--pm-text)' }}>
              Driver <strong>Kwame Mensah</strong> achieved 98% remittance reliability and lowest idle fuel burn across your fleet corridor.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: 'var(--pm-space-4)', borderRadius: 'var(--pm-radius-md)', border: '1px solid var(--pm-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pm-warning)', textTransform: 'uppercase' }}>
              Maintenance Countdown
            </div>
            <p style={{ fontSize: '0.8125rem', margin: '4px 0 0 0', lineHeight: 1.5, color: 'var(--pm-text)' }}>
              Vehicle <strong>GR-4521-22</strong> front brakes will reach safe wear limit in approximately <strong>10 operating days</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--pm-space-2)', marginBottom: 'var(--pm-space-5)' }}>
        <button
          className={`pm-btn ${activeTab === 'fuel' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
          onClick={() => setActiveTab('fuel')}
        >
          <Fuel size={16} /> Fuel Anomaly Detection ({mockFuelAnomalies.length})
        </button>
        <button
          className={`pm-btn ${activeTab === 'drivers' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
          onClick={() => setActiveTab('drivers')}
        >
          <Users size={16} /> Driver Scorecards ({mockDriverScorecards.length})
        </button>
        <button
          className={`pm-btn ${activeTab === 'maintenance' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <Wrench size={16} /> Predictive Maintenance ({mockPredictions.length})
        </button>
      </div>

      {/* Tab 1: Fuel Anomalies */}
      {activeTab === 'fuel' && (
        <div className="pm-card">
          <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Vehicle & Model</th>
                  <th>Assigned Driver</th>
                  <th style={{ textAlign: 'right' }}>Baseline (L/100km)</th>
                  <th style={{ textAlign: 'right' }}>Actual (L/100km)</th>
                  <th style={{ textAlign: 'right' }}>Variance</th>
                  <th>Intelligence Classification</th>
                  <th>Analysis Notes</th>
                </tr>
              </thead>
              <tbody>
                {mockFuelAnomalies.map(fa => (
                  <tr key={fa.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fa.plateNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>{fa.model}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{fa.driverName}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fa.baselineLitresPer100Km.toFixed(1)} L</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{fa.actualLitresPer100Km.toFixed(1)} L</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700,
                        color: fa.variancePercentage > 15 ? 'var(--pm-error)' : fa.variancePercentage > 5 ? 'var(--pm-warning)' : 'var(--pm-success)',
                      }}>
                        {fa.variancePercentage > 0 ? `+${fa.variancePercentage}%` : `${fa.variancePercentage}%`}
                        {fa.variancePercentage > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </span>
                    </td>
                    <td>
                      {fa.flagType === 'suspected_siphon' && (
                        <span className="pm-badge pm-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Suspected Fuel Siphon
                        </span>
                      )}
                      {fa.flagType === 'engine_inefficiency' && (
                        <span className="pm-badge pm-badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Wrench size={12} /> Inefficiency Detected
                        </span>
                      )}
                      {fa.flagType === 'normal' && (
                        <span className="pm-badge pm-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Optimal Baseline
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: 300, fontSize: '0.75rem', color: 'var(--pm-text-secondary)', lineHeight: 1.4 }}>
                      {fa.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Driver Scorecards */}
      {activeTab === 'drivers' && (
        <div className="pm-card">
          <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Assigned Vehicle</th>
                  <th style={{ textAlign: 'center' }}>Speed Events</th>
                  <th style={{ textAlign: 'center' }}>Idle Time %</th>
                  <th style={{ textAlign: 'center' }}>Remittance Rate</th>
                  <th style={{ textAlign: 'center' }}>Incidents</th>
                  <th style={{ textAlign: 'right' }}>Safety Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockDriverScorecards.map(sc => (
                  <tr key={sc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sc.driverName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{sc.phone}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{sc.vehiclePlate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                        background: sc.speedViolationsCount > 5 ? 'var(--pm-error-light)' : 'var(--pm-bg-muted)',
                        color: sc.speedViolationsCount > 5 ? 'var(--pm-error)' : 'inherit',
                      }}>
                        {sc.speedViolationsCount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem' }}>{sc.idleTimePercentage}%</td>
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, color: sc.remittanceConsistencyPercentage >= 95 ? 'var(--pm-success)' : 'inherit' }}>
                      {sc.remittanceConsistencyPercentage}%
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem' }}>{sc.incidentsReported}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '1.125rem', fontWeight: 800,
                        color: sc.overallScore >= 90 ? 'var(--pm-success)' : sc.overallScore >= 75 ? 'var(--pm-blue-600)' : 'var(--pm-error)',
                      }}>
                        {sc.overallScore}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>/100</span>
                    </td>
                    <td>
                      {sc.status === 'star' && (
                        <span className="pm-badge pm-badge-success">Star Driver</span>
                      )}
                      {sc.status === 'reliable' && (
                        <span className="pm-badge pm-badge-neutral">Reliable</span>
                      )}
                      {sc.status === 'coaching_required' && (
                        <span className="pm-badge pm-badge-pending">Coaching Flag</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Predictive Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="pm-card">
          <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Component</th>
                  <th>Current Odometer</th>
                  <th>Projected Due At</th>
                  <th style={{ textAlign: 'right' }}>Estimated Days Left</th>
                  <th style={{ textAlign: 'right' }}>Estimated Cost</th>
                  <th>Urgency Indicator</th>
                </tr>
              </thead>
              <tbody>
                {mockPredictions.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.vehiclePlate}</td>
                    <td style={{ fontWeight: 500 }}>{p.component}</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.currentOdoKm.toLocaleString()} km</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.projectedDueOdoKm.toLocaleString()} km</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span style={{
                        color: p.daysRemaining <= 10 ? 'var(--pm-error)' : p.daysRemaining <= 20 ? 'var(--pm-warning)' : 'var(--pm-success)',
                      }}>
                        {p.daysRemaining} days
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="pm-text-money">
                      {formatPesewas(p.estimatedCostPesewas)}
                    </td>
                    <td>
                      {p.urgency === 'critical' && (
                        <span className="pm-badge pm-badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> Service Imminent
                        </span>
                      )}
                      {p.urgency === 'upcoming' && (
                        <span className="pm-badge pm-badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> Schedule Soon
                        </span>
                      )}
                      {p.urgency === 'good' && (
                        <span className="pm-badge pm-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Good Condition
                        </span>
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
  );
}
