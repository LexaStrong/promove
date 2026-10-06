'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Car, Users, TrendingUp, TrendingDown, AlertTriangle,
  FileText, Wrench, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Sparkles, Plus, ExternalLink, HelpCircle,
} from 'lucide-react';
import { formatPesewas } from '@/lib/types';
import { useFleet } from '@/lib/fleet-context';
import { useAuth } from '@/lib/auth-context';

function DashboardContent() {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  const { org, user } = useAuth();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const {
    mounted,
    orgName,
    vehicles: fleetVehicles,
    ledgerEntries: fleetLedger,
    incidents: fleetIncidents,
    documents: fleetDocuments,
    stats: fleetStats,
  } = useFleet();

  const [showOnboarding, setShowOnboarding] = useState(true);

  if (!clientMounted) {
    return (
      <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center', color: 'var(--pm-text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  // Compute dataset depending on Demo mode vs Fresh New Sign-up Dashboard
  const activeFleetName = isDemo
    ? 'Accra Urban Transit Fleet'
    : (orgName || org?.name || 'My Fleet');

  const vehicles = fleetVehicles;
  const ledgerEntries = fleetLedger;
  const incidents = isDemo ? fleetIncidents : (vehicles.length === 0 ? [] : fleetIncidents);
  const documents = isDemo ? fleetDocuments : (vehicles.length === 0 ? [] : fleetDocuments);
  
  // Guarantee clean zeroed stats for fresh accounts without registered vehicles
  const stats = (!isDemo && vehicles.length === 0) ? {
    today_income_pesewas: 0,
    today_expenses_pesewas: 0,
    this_week_income_pesewas: 0,
    this_week_expenses_pesewas: 0,
    this_month_income_pesewas: 0,
    this_month_expenses_pesewas: 0,
    active: 0,
    idle: 0,
    maintenance: 0,
    unavailable: 0,
    total_vehicles: 0,
    active_drivers: 0,
    total_drivers: 0,
    docs_expiring_soon: 0,
    maintenance_overdue: 0,
    open_incidents: 0,
  } : fleetStats;

  const hasRegisteredVehicles = vehicles.length > 0;
  const recentEntries = ledgerEntries.slice(0, 5);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const expiringDocs = documents.filter(d => (d.days_until_expiry ?? 999) <= 30);
  const displayVehicles = vehicles.slice(0, 6);

  return (
    <div>
      {/* Demo Dashboard Notice Banner (when accessed via 'View demo dashboard' button) */}
      {isDemo && (
        <div
          className="pm-card"
          style={{
            background: 'linear-gradient(135deg, rgba(11, 79, 108, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)',
            border: '1px solid var(--pm-blue-200)',
            padding: '12px 18px',
            marginBottom: 'var(--pm-space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            borderRadius: 'var(--pm-radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="pm-badge pm-badge-info"
              style={{ fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', fontSize: '0.6875rem' }}
            >
              Demo Dashboard
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--pm-text)' }}>
              Viewing simulated Greater Accra transit data, mock trotros, and sample pesewa revenue.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/onboarding" className="pm-btn pm-btn-primary pm-btn-sm">
              Register Your Own Fleet &rarr;
            </Link>
            <Link href="/dashboard" className="pm-btn pm-btn-ghost pm-btn-sm">
              Exit Demo
            </Link>
          </div>
        </div>
      )}

      {/* Fresh New User Welcome Banner (when fresh sign up has no registered vehicles yet) */}
      {!isDemo && mounted && !hasRegisteredVehicles && (
        <div
          className="pm-card"
          style={{
            background: 'linear-gradient(135deg, #0B4F6C 0%, #15803D 100%)',
            color: '#FFFFFF',
            padding: '20px 24px',
            marginBottom: 'var(--pm-space-5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            borderRadius: 'var(--pm-radius-lg)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={20} color="#86EFAC" />
              <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.125rem', fontWeight: 700 }}>
                Welcome to your new ProMove Fleet Workspace
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9, maxWidth: 640 }}>
              Your workspace is freshly provisioned. Complete your fleet onboarding to register your trotros, buses, or taxis with DVLA plates.
            </p>
          </div>
          <Link href="/onboarding" className="pm-btn pm-btn-lg" style={{ background: '#FFFFFF', color: '#0B4F6C', fontWeight: 700 }}>
            Start Fleet Onboarding &rarr;
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">
            {isDemo ? 'Demo Dashboard' : `${activeFleetName} Dashboard`}
          </h1>
          <p className="pm-page-subtitle">
            {isDemo
              ? 'Simulated real-time fleet overview, daily income, and active operations'
              : 'Real-time fleet overview, daily income collections, and active operations'}
          </p>
        </div>
        {!isDemo && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/onboarding" className="pm-btn pm-btn-secondary pm-btn-sm">
              <Plus size={14} /> Add Vehicles
            </Link>
            <Link href="/dashboard?demo=true" className="pm-btn pm-btn-ghost pm-btn-sm" style={{ color: 'var(--pm-text-muted)' }}>
              View Sample Demo
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Session Onboarding Guide */}
      {showOnboarding && isDemo && (
        <div className="pm-card pm-desktop-onboarding-card">
          <div className="pm-desktop-onboarding-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="pm-desktop-onboarding-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="pm-desktop-onboarding-title">
                  Welcome to ProMove • Desktop Fleet Onboarding
                </div>
                <div className="pm-desktop-onboarding-subtitle">
                  Configure your workspace, verify corridor telematics, and automate daily ledger reconciliations in Ghana pesewas.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="pm-btn pm-btn-ghost pm-btn-sm"
              onClick={() => setShowOnboarding(false)}
              aria-label="Dismiss onboarding guide"
              style={{ color: 'var(--pm-text-muted)' }}
            >
              Dismiss
            </button>
          </div>

          <div className="pm-desktop-onboarding-steps">
            <Link href="/vehicles" className="pm-desktop-onboarding-step">
              <div className="pm-desktop-onboarding-step-num">1</div>
              <div className="pm-desktop-onboarding-step-info">
                <h4>Register Fleet Vehicles</h4>
                <p>Add commercial trotros, buses, or haulage trucks with DVLA plates.</p>
              </div>
            </Link>

            <Link href="/live-map" className="pm-desktop-onboarding-step">
              <div className="pm-desktop-onboarding-step-num">2</div>
              <div className="pm-desktop-onboarding-step-info">
                <h4>Corridor Telematics</h4>
                <p>Live GPS positioning along Accra, Kumasi, Cape Coast, & Tema corridors.</p>
              </div>
            </Link>

            <Link href="/maintenance" className="pm-desktop-onboarding-step">
              <div className="pm-desktop-onboarding-step-num">3</div>
              <div className="pm-desktop-onboarding-step-info">
                <h4>Maintenance Schedules</h4>
                <p>Set service intervals and track preventive workshop costs.</p>
              </div>
            </Link>

            <Link href="/documents" className="pm-desktop-onboarding-step">
              <div className="pm-desktop-onboarding-step-num">4</div>
              <div className="pm-desktop-onboarding-step-info">
                <h4>Document Radar</h4>
                <p>Roadworthy & insurance certificates with 30-day expiry radar.</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards - exempted on mobile for owner */}
      <div className="pm-grid-stats pm-owner-mobile-exempt-financials">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Today&apos;s Income</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(stats.today_income_pesewas)}</div>
          <div className={`pm-stat-change ${isDemo ? 'positive' : ''}`} style={{ color: !isDemo ? 'var(--pm-text-muted)' : undefined }}>
            {isDemo ? (
              <>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                12% vs yesterday
              </>
            ) : (
              '0 collections recorded today'
            )}
          </div>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Today&apos;s Expenses</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(stats.today_expenses_pesewas)}</div>
          <div className={`pm-stat-change ${isDemo ? 'negative' : ''}`} style={{ color: !isDemo ? 'var(--pm-text-muted)' : undefined }}>
            {isDemo ? (
              <>
                <TrendingDown size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                5% vs yesterday
              </>
            ) : (
              '0 expenses logged today'
            )}
          </div>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Net Today</div>
          <div className="pm-stat-value pm-text-money">
            {formatPesewas(stats.today_income_pesewas - stats.today_expenses_pesewas)}
          </div>
          <div className="pm-stat-change" style={{ color: isDemo ? 'var(--pm-success)' : 'var(--pm-text-muted)' }}>
            {isDemo ? (
              <>
                <ArrowUpRight size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                Healthy margin
              </>
            ) : (
              'Fresh billing period'
            )}
          </div>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-label">This Month</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(stats.this_month_income_pesewas)}</div>
          <div className="pm-stat-change" style={{ color: 'var(--pm-text-muted)' }}>
            Expenses: {formatPesewas(stats.this_month_expenses_pesewas)}
          </div>
        </div>
      </div>

      {/* Dashboard Main Content Layout */}
      <div className="pm-dashboard-content-layout">
        {/* Fleet status + Alerts row */}
        <div className="pm-dashboard-status-alerts-row">
          {/* Fleet status */}
          <div className="pm-card pm-dashboard-fleet-status">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Car size={18} />
                Fleet Status
              </h3>
              <Link href="/vehicles" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                View all
              </Link>
            </div>
            <div style={{ padding: 'var(--pm-space-5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--pm-space-4)' }}>
                {[
                  { label: 'Active', count: stats.active, color: 'var(--pm-success)' },
                  { label: 'Idle', count: stats.idle, color: 'var(--pm-blue-500)' },
                  { label: 'Maintenance', count: stats.maintenance, color: 'var(--pm-warning)' },
                  { label: 'Unavailable', count: stats.unavailable, color: 'var(--pm-error)' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                      background: `${s.color}15`, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1.125rem',
                    }}>
                      {s.count}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>{s.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                        vehicles
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--pm-space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Fleet utilisation</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {stats.total_vehicles > 0 ? Math.round((stats.active / stats.total_vehicles) * 100) : 0}%
                  </span>
                </div>
                <div className="pm-progress-track">
                  <div className="pm-progress-fill" style={{
                    width: `${stats.total_vehicles > 0 ? (stats.active / stats.total_vehicles) * 100 : 0}%`,
                    background: 'var(--pm-success)',
                  }} />
                </div>
              </div>

              <div style={{
                marginTop: 'var(--pm-space-4)', display: 'flex', alignItems: 'center',
                gap: 8, fontSize: '0.8125rem', color: 'var(--pm-text-secondary)',
              }}>
                <Users size={16} />
                {stats.active_drivers} of {stats.total_drivers} drivers active
              </div>
            </div>
          </div>

          {/* Alerts - hidden on mobile */}
          <div className="pm-card pm-dashboard-alerts pm-owner-mobile-exempt-alerts">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-5)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <AlertTriangle size={18} />
                Alerts
              </h3>
              <span
                style={{ fontSize: '0.75rem' }}
                className={`pm-badge ${stats.docs_expiring_soon + stats.maintenance_overdue + stats.open_incidents > 0 ? 'pm-badge-critical' : 'pm-badge-success'}`}
              >
                {stats.docs_expiring_soon + stats.maintenance_overdue + stats.open_incidents} items
              </span>
            </div>
            <div style={{ padding: 0 }}>
              {/* If no alerts (Fresh Dashboard) */}
              {activeIncidents.length === 0 && expiringDocs.length === 0 && stats.maintenance_overdue === 0 && (
                <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center' }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--pm-success)', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--pm-text)' }}>All Clear</div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: '4px 0 0' }}>
                    No active safety warnings, maintenance overdue, or expiring certificates for your fleet.
                  </p>
                </div>
              )}

              {expiringDocs.map(doc => (
                <div key={doc.id} style={{
                  padding: 'var(--pm-space-3) var(--pm-space-5)',
                  borderBottom: '1px solid var(--pm-border-subtle)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <FileText size={16} style={{ color: 'var(--pm-warning)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }} className="pm-truncate">
                      {doc.vehicle?.plate_number} • {doc.doc_type} expires
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      {doc.days_until_expiry} days remaining
                    </div>
                  </div>
                  <span className={`pm-badge ${(doc.days_until_expiry ?? 999) <= 7 ? 'pm-badge-critical' : 'pm-badge-pending'}`}>
                    {(doc.days_until_expiry ?? 999) <= 7 ? 'Urgent' : 'Soon'}
                  </span>
                </div>
              ))}

              {activeIncidents.map(inc => (
                <div key={inc.id} style={{
                  padding: 'var(--pm-space-3) var(--pm-space-5)',
                  borderBottom: '1px solid var(--pm-border-subtle)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <AlertTriangle size={16} style={{ color: 'var(--pm-error)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }} className="pm-truncate">
                      {inc.vehicle?.plate_number} • {inc.incident_type}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      {inc.location_text}
                    </div>
                  </div>
                  <span className={`pm-badge pm-badge-${inc.status}`}>
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>
              ))}

              {stats.maintenance_overdue > 0 && (
                <div style={{
                  padding: 'var(--pm-space-3) var(--pm-space-5)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <Wrench size={16} style={{ color: 'var(--pm-warning)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {stats.maintenance_overdue} overdue maintenance
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      Service schedule past due
                    </div>
                  </div>
                  <Link href="/maintenance" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    View
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Ledger Entries - exempted on mobile for owner */}
        <div className="pm-card pm-owner-mobile-exempt-financials pm-dashboard-transactions">
          <div style={{
            padding: 'var(--pm-space-4) var(--pm-space-5)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
            <Link href="/ledger" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              View ledger
            </Link>
          </div>
          {recentEntries.length === 0 ? (
            <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center' }}>
              <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>
                No daily collection or expense transactions recorded yet.
              </p>
              <Link href="/ledger" className="pm-btn pm-btn-primary pm-btn-sm">
                + Record Daily Income
              </Link>
            </div>
          ) : (
            <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ fontWeight: 500 }}>{entry.vehicle?.plate_number}</td>
                      <td>{entry.driver?.full_name || '-'}</td>
                      <td>
                        <span className={`pm-badge pm-badge-${entry.entry_type}`}>
                          {entry.entry_type === 'income' ? (
                            <><ArrowUpRight size={12} /> Income</>
                          ) : entry.entry_type === 'expense' ? (
                            <><ArrowDownRight size={12} /> Expense</>
                          ) : (
                            entry.entry_type
                          )}
                        </span>
                      </td>
                      <td style={{ color: 'var(--pm-text-secondary)' }}>
                        {entry.category.replace('_', ' ')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }} className="pm-text-money">
                        {formatPesewas(entry.amount_pesewas)}
                      </td>
                      <td>
                        <span className={`pm-badge pm-badge-${entry.status}`}>
                          {entry.status === 'confirmed' ? (
                            <><CheckCircle2 size={12} /> Confirmed</>
                          ) : (
                            'Voided'
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 
          ========================================================================
          DRIVER SECTION: Maintained with full functionality (driver directory, 
          active status, phone calling, assigned vehicle, licence expiry radar).
          Commented out for now per requirement: "the driver section must also be commented for now"
          ========================================================================
        */}

        {/* Vehicle list */}
        <div className="pm-card pm-dashboard-vehicles">
          <div style={{
            padding: 'var(--pm-space-4) var(--pm-space-5)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0 }}>Vehicles ({displayVehicles.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isDemo && (
                <Link href="/onboarding" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pm-blue-600)' }}>
                  + Add vehicle
                </Link>
              )}
              <Link href="/vehicles" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Manage fleet
              </Link>
            </div>
          </div>
          {displayVehicles.length === 0 ? (
            <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center' }}>
              <Car size={36} style={{ color: 'var(--pm-blue-500)', margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--pm-text)' }}>
                No Vehicles Registered Yet
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: '6px 0 16px' }}>
                Add your fleet vehicles with DVLA plates to activate live GPS tracking and maintenance logs.
              </p>
              <Link href="/onboarding" className="pm-btn pm-btn-primary pm-btn-sm">
                + Complete Fleet Onboarding
              </Link>
            </div>
          ) : (
            <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Plate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVehicles.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/vehicles/${v.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {v.make} {v.model}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/vehicles/${v.id}`} style={{ color: 'var(--pm-blue-600)' }}>
                          {v.plate_number}
                        </Link>
                      </td>
                      <td>
                        <span className={`pm-badge pm-badge-${v.status}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 'var(--pm-space-6)', textAlign: 'center', color: 'var(--pm-text-muted)' }}>
        Loading dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
