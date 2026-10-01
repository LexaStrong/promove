'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car, Users, TrendingUp, TrendingDown, AlertTriangle,
  FileText, Wrench, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2,
} from 'lucide-react';
import { formatPesewas } from '@/lib/types';
import {
  mockFleetStats, mockVehicles, mockLedgerEntries,
  mockIncidents, mockDocuments, mockNotifications,
} from '@/lib/mock-data';

export default function DashboardPage() {
  const stats = mockFleetStats;
  const recentEntries = mockLedgerEntries.slice(0, 5);
  const activeIncidents = mockIncidents.filter(i => i.status !== 'resolved');
  const expiringDocs = mockDocuments.filter(d => (d.days_until_expiry ?? 999) <= 30);
  const unreadNotifs = mockNotifications.filter(n => n.status !== 'read');

  return (
    <div>
      {/* Page header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Dashboard</h1>
          <p className="pm-page-subtitle">
            Fleet overview for {new Date().toLocaleDateString('en-GH', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Today&apos;s Income</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(stats.today_income_pesewas)}</div>
          <div className="pm-stat-change positive">
            <TrendingUp size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
            12% vs yesterday
          </div>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Today&apos;s Expenses</div>
          <div className="pm-stat-value pm-text-money">{formatPesewas(stats.today_expenses_pesewas)}</div>
          <div className="pm-stat-change negative">
            <TrendingDown size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
            5% vs yesterday
          </div>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Net Today</div>
          <div className="pm-stat-value pm-text-money">
            {formatPesewas(stats.today_income_pesewas - stats.today_expenses_pesewas)}
          </div>
          <div className="pm-stat-change positive">
            <ArrowUpRight size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
            Healthy margin
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

      {/* Fleet status + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)', marginBottom: 'var(--pm-space-6)' }}>
        {/* Fleet status */}
        <div className="pm-card">
          <div style={{
            padding: 'var(--pm-space-4) var(--pm-space-5)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  {Math.round((stats.active / stats.total_vehicles) * 100)}%
                </span>
              </div>
              <div className="pm-progress-track">
                <div className="pm-progress-fill" style={{
                  width: `${(stats.active / stats.total_vehicles) * 100}%`,
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

        {/* Alerts */}
        <div className="pm-card">
          <div style={{
            padding: 'var(--pm-space-4) var(--pm-space-5)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} />
              Alerts
            </h3>
            <span style={{ fontSize: '0.75rem' }} className="pm-badge pm-badge-critical">
              {stats.docs_expiring_soon + stats.maintenance_overdue + stats.open_incidents} items
            </span>
          </div>
          <div style={{ padding: 0 }}>
            {expiringDocs.map(doc => (
              <div key={doc.id} style={{
                padding: 'var(--pm-space-3) var(--pm-space-5)',
                borderBottom: '1px solid var(--pm-border-subtle)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <FileText size={16} style={{ color: 'var(--pm-warning)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }} className="pm-truncate">
                    {doc.vehicle?.plate_number} — {doc.doc_type} expires
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
                    {inc.vehicle?.plate_number} — {inc.incident_type}
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

      {/* Recent Ledger Entries */}
      <div className="pm-card" style={{ marginBottom: 'var(--pm-space-6)' }}>
        <div style={{
          padding: 'var(--pm-space-4) var(--pm-space-5)',
          borderBottom: '1px solid var(--pm-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3>Recent Transactions</h3>
          <Link href="/ledger" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
            View ledger
          </Link>
        </div>
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
                  <td>{entry.driver?.full_name || '—'}</td>
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
      </div>

      {/* Vehicle list */}
      <div className="pm-card">
        <div style={{
          padding: 'var(--pm-space-4) var(--pm-space-5)',
          borderBottom: '1px solid var(--pm-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3>Vehicles</h3>
          <Link href="/vehicles" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
            Manage fleet
          </Link>
        </div>
        <div className="pm-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Driver</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Odometer</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicles.slice(0, 6).map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/vehicles/${v.id}`}>{v.plate_number}</Link>
                  </td>
                  <td>{v.make} {v.model}</td>
                  <td style={{ color: 'var(--pm-text-secondary)' }}>{v.vehicle_type}</td>
                  <td>
                    {v.current_driver ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="pm-topbar-avatar" style={{ width: 24, height: 24, fontSize: '0.625rem' }}>
                          {v.current_driver.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                        {v.current_driver.full_name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--pm-text-muted)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`pm-badge pm-badge-${v.status}`}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--pm-text-secondary)' }}>
                    {v.odometer_km.toLocaleString()} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
