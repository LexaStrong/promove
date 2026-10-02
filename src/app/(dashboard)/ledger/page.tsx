'use client';

import React, { useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpRight, ArrowDownRight, CheckCircle2,
  XCircle, BookOpen, Download, AlertTriangle, RefreshCw, BarChart3,
} from 'lucide-react';
import { formatPesewas, EntryType, LedgerStatus, LedgerEntry, LedgerCategory, PaymentMethod } from '@/lib/types';
import { mockLedgerEntries, mockVehicles, mockDrivers } from '@/lib/mock-data';

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>(mockLedgerEntries);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntryType | ''>('');
  const [statusFilter, setStatusFilter] = useState<LedgerStatus | ''>('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'entries' | 'daily_targets'>('entries');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryToVoid, setEntryToVoid] = useState<LedgerEntry | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState<string | null>(null);

  // New entry form state
  const [addType, setAddType] = useState<EntryType>('income');
  const [newEntryForm, setNewEntryForm] = useState({
    vehicle_id: mockVehicles[0]?.id || '',
    driver_id: mockDrivers[0]?.id || '',
    entry_date: new Date().toISOString().slice(0, 10),
    category: 'daily_sales' as LedgerCategory,
    amount_cedis: '',
    payment_method: 'cash' as PaymentMethod,
    reference: '',
    notes: '',
  });

  const handleRecordEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newEntryForm.amount_cedis);
    if (!amountVal || isNaN(amountVal) || amountVal <= 0) return;

    const veh = mockVehicles.find(v => v.id === newEntryForm.vehicle_id);
    const drv = mockDrivers.find(d => d.id === newEntryForm.driver_id);

    const created: LedgerEntry = {
      id: `led-${Date.now()}`,
      org_id: 'org-demo',
      vehicle_id: newEntryForm.vehicle_id,
      driver_id: newEntryForm.driver_id || null,
      trip_id: null,
      entry_date: newEntryForm.entry_date,
      entry_type: addType,
      category: newEntryForm.category,
      amount_pesewas: Math.round(amountVal * 100),
      payment_method: newEntryForm.payment_method,
      reference: newEntryForm.reference || null,
      status: 'confirmed',
      voided_by_entry_id: null,
      void_reason: null,
      recorded_by: 'Owner / Manager',
      idempotency_key: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      notes: newEntryForm.notes || null,
      created_at: new Date().toISOString(),
      vehicle: veh,
      driver: drv,
    };

    setEntries(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewEntryForm({
      vehicle_id: mockVehicles[0]?.id || '',
      driver_id: mockDrivers[0]?.id || '',
      entry_date: new Date().toISOString().slice(0, 10),
      category: 'daily_sales',
      amount_cedis: '',
      payment_method: 'cash',
      reference: '',
      notes: '',
    });
  };

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryToVoid) return;
    if (!voidReason.trim()) {
      setVoidError('A mandatory explanation is required to void any ledger entry.');
      return;
    }

    const reversalId = `rev-${Date.now()}`;
    const reversingEntry: LedgerEntry = {
      id: reversalId,
      org_id: entryToVoid.org_id,
      vehicle_id: entryToVoid.vehicle_id,
      driver_id: entryToVoid.driver_id,
      trip_id: entryToVoid.trip_id,
      entry_date: new Date().toISOString().slice(0, 10),
      entry_type: 'adjustment',
      category: 'other',
      amount_pesewas: entryToVoid.amount_pesewas,
      payment_method: entryToVoid.payment_method,
      reference: `Reversal of #${entryToVoid.id.slice(0, 8)}`,
      status: 'confirmed',
      voided_by_entry_id: null,
      void_reason: null,
      recorded_by: 'Owner (Audited)',
      idempotency_key: `rev-idemp-${Date.now()}`,
      notes: `Automated reversal for voided entry #${entryToVoid.id.slice(0, 8)}: ${voidReason.trim()}`,
      created_at: new Date().toISOString(),
      vehicle: entryToVoid.vehicle,
      driver: entryToVoid.driver,
    };

    setEntries(prev => [
      reversingEntry,
      ...prev.map(item =>
        item.id === entryToVoid.id
          ? {
              ...item,
              status: 'voided' as LedgerStatus,
              void_reason: voidReason.trim(),
              voided_by_entry_id: reversalId,
            }
          : item
      ),
    ]);

    setEntryToVoid(null);
    setVoidReason('');
    setVoidError(null);
  };

  const filtered = entries.filter(e => {
    if (typeFilter && e.entry_type !== typeFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    if (vehicleFilter && e.vehicle_id !== vehicleFilter) return false;
    if (search && !`${e.vehicle?.plate_number} ${e.driver?.full_name} ${e.notes || ''} ${e.category}`
      .toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const confirmedEntries = filtered.filter(e => e.status === 'confirmed');
  const totalIncome = confirmedEntries.filter(e => e.entry_type === 'income').reduce((s, e) => s + e.amount_pesewas, 0);
  const totalExpenses = confirmedEntries.filter(e => ['expense', 'commission'].includes(e.entry_type)).reduce((s, e) => s + e.amount_pesewas, 0);

  // Daily target vs actuals per vehicle
  const targetSummaries = mockVehicles.filter(v => !v.archived_at).map(v => {
    const todayEntries = entries.filter(
      e => e.vehicle_id === v.id && e.entry_type === 'income' && e.status === 'confirmed'
    );
    const actualPesewas = todayEntries.reduce((s, e) => s + e.amount_pesewas, 0);
    const targetPesewas = v.daily_target_pesewas || 35000;
    const percent = Math.round((actualPesewas / targetPesewas) * 100);
    return {
      vehicle: v,
      actualPesewas,
      targetPesewas,
      percent,
      driver: v.current_driver,
    };
  });

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Daily Ledger</h1>
          <p className="pm-page-subtitle">Immutable append-only record of all fleet financial movements</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--pm-space-3)' }}>
          <button
            className={`pm-btn ${viewMode === 'daily_targets' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
            onClick={() => setViewMode(viewMode === 'entries' ? 'daily_targets' : 'entries')}
          >
            <BarChart3 size={16} /> {viewMode === 'entries' ? 'Daily Targets' : 'Ledger Entries'}
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => { setAddType('income'); setShowAddModal(true); }}>
            <Plus size={16} /> Record Entry
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="pm-grid-stats" style={{ marginBottom: 'var(--pm-space-4)' }}>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Income</div>
          <div className="pm-stat-value pm-text-money" style={{ color: 'var(--pm-success)' }}>
            {formatPesewas(totalIncome)}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Expenses</div>
          <div className="pm-stat-value pm-text-money" style={{ color: 'var(--pm-error)' }}>
            {formatPesewas(totalExpenses)}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Net</div>
          <div className="pm-stat-value pm-text-money">
            {formatPesewas(totalIncome - totalExpenses)}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Entries</div>
          <div className="pm-stat-value">{filtered.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 'var(--pm-space-3)', marginBottom: 'var(--pm-space-4)',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--pm-text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text" className="pm-input" placeholder="Search entries..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="pm-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as EntryType | '')} style={{ width: 140 }}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="commission">Commission</option>
          <option value="remittance">Remittance</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <select className="pm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as LedgerStatus | '')} style={{ width: 140 }}>
          <option value="">All status</option>
          <option value="confirmed">Confirmed</option>
          <option value="voided">Voided</option>
        </select>
        <select className="pm-select" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">All vehicles</option>
          {mockVehicles.map(v => (
            <option key={v.id} value={v.id}>{v.plate_number}</option>
          ))}
        </select>
      </div>

      {/* View Toggle: Table vs Daily Targets */}
      {viewMode === 'daily_targets' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          <div className="pm-card" style={{ padding: 'var(--pm-space-5)' }}>
            <h3 style={{ marginBottom: 'var(--pm-space-2)' }}>Daily Shift Performance vs Targets</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)' }}>
              Real-time daily collection tracking per vehicle and assigned driver against contractual targets
            </p>

            <div className="pm-table-wrapper" style={{ border: 'none' }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Vehicle Type</th>
                    <th style={{ textAlign: 'right' }}>Target</th>
                    <th style={{ textAlign: 'right' }}>Collected Today</th>
                    <th style={{ textAlign: 'right' }}>Variance</th>
                    <th style={{ width: 180 }}>Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {targetSummaries.map(t => {
                    const diff = t.actualPesewas - t.targetPesewas;
                    const isMet = diff >= 0;
                    return (
                      <tr key={t.vehicle.id}>
                        <td style={{ fontWeight: 600 }}>{t.vehicle.plate_number}</td>
                        <td>{t.driver?.full_name || 'Unassigned'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{t.vehicle.vehicle_type}</td>
                        <td style={{ textAlign: 'right' }}>{formatPesewas(t.targetPesewas)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }} className="pm-text-money">
                          {formatPesewas(t.actualPesewas)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: isMet ? 'var(--pm-success)' : 'var(--pm-error)' }}>
                          {isMet ? `+${formatPesewas(diff)}` : `-${formatPesewas(Math.abs(diff))}`}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              flex: 1, height: 8, background: 'var(--pm-bg-muted)', borderRadius: 4, overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(t.percent, 100)}%`,
                                height: '100%',
                                background: isMet ? 'var(--pm-success)' : 'var(--pm-warning)',
                                borderRadius: 4,
                              }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>
                              {t.percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Ledger Entries Table */
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Type</th>
                <th>Category</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} style={entry.status === 'voided' ? { opacity: 0.55, background: 'var(--pm-bg-subtle)' } : {}}>
                  <td style={{ whiteSpace: 'nowrap' }}>{entry.entry_date}</td>
                  <td style={{ fontWeight: 500 }}>{entry.vehicle?.plate_number}</td>
                  <td>{entry.driver?.full_name || '-'}</td>
                  <td>
                    <span className={`pm-badge pm-badge-${entry.entry_type}`}>
                      {entry.entry_type === 'income' && <ArrowUpRight size={12} />}
                      {entry.entry_type === 'expense' && <ArrowDownRight size={12} />}
                      {entry.entry_type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--pm-text-secondary)', textTransform: 'capitalize' }}>
                    {entry.category.replace('_', ' ')}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>
                    {entry.payment_method === 'cash' ? 'Cash' :
                     entry.payment_method === 'momo_manual' ? 'MoMo' : 'Hubtel'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }} className="pm-text-money">
                    <span style={{
                      color: entry.entry_type === 'income' ? 'var(--pm-success)' :
                             entry.entry_type === 'adjustment' ? 'var(--pm-blue-600)' : 'var(--pm-text)',
                    }}>
                      {entry.entry_type === 'income' ? '+' : entry.entry_type === 'adjustment' ? '±' : '-'}
                      {formatPesewas(entry.amount_pesewas)}
                    </span>
                  </td>
                  <td>
                    {entry.status === 'confirmed' ? (
                      <span className="pm-badge pm-badge-confirmed">
                        <CheckCircle2 size={12} /> Confirmed
                      </span>
                    ) : (
                      <span className="pm-badge pm-badge-voided" title={`Voided: ${entry.void_reason || 'Reversed'}`}>
                        <XCircle size={12} /> Voided
                      </span>
                    )}
                  </td>
                  <td style={{
                    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--pm-text-muted)',
                  }}>
                    {entry.notes || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {entry.status === 'confirmed' ? (
                      <button
                        className="pm-btn pm-btn-ghost pm-btn-sm"
                        style={{ color: 'var(--pm-error)', padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setEntryToVoid(entry); setVoidReason(''); setVoidError(null); }}
                        title="Void this entry with mandatory reversing entry"
                      >
                        Void
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>
                        Reversed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && viewMode === 'entries' && (
        <div className="pm-empty">
          <div className="pm-empty-icon"><BookOpen size={24} /></div>
          <div className="pm-empty-title">No entries found</div>
          <div className="pm-empty-desc">Try adjusting your filters or record a new entry.</div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <form onSubmit={handleRecordEntry}>
              <div className="pm-modal-header">
                <h3>Record Ledger Entry</h3>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="pm-modal-body">
                {/* Type toggle */}
                <div style={{
                  display: 'flex', gap: 'var(--pm-space-2)', marginBottom: 'var(--pm-space-5)',
                  background: 'var(--pm-bg-subtle)', padding: 4, borderRadius: 'var(--pm-radius-md)',
                }}>
                  {(['income', 'expense', 'commission', 'remittance'] as EntryType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`pm-btn ${addType === t ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                      onClick={() => setAddType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="pm-form-group">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Vehicle</label>
                      <select
                        className="pm-select"
                        value={newEntryForm.vehicle_id}
                        onChange={e => setNewEntryForm({ ...newEntryForm, vehicle_id: e.target.value })}
                      >
                        {mockVehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.plate_number}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Driver</label>
                      <select
                        className="pm-select"
                        value={newEntryForm.driver_id}
                        onChange={e => setNewEntryForm({ ...newEntryForm, driver_id: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {mockDrivers.map(d => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Date</label>
                      <input
                        type="date"
                        className="pm-input"
                        value={newEntryForm.entry_date}
                        onChange={e => setNewEntryForm({ ...newEntryForm, entry_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Category</label>
                      <select
                        className="pm-select"
                        value={newEntryForm.category}
                        onChange={e => setNewEntryForm({ ...newEntryForm, category: e.target.value as LedgerCategory })}
                      >
                        <option value="daily_sales">Daily Sales</option>
                        <option value="fuel">Fuel</option>
                        <option value="repair">Repair</option>
                        <option value="parts">Parts</option>
                        <option value="insurance">Insurance</option>
                        <option value="fine">Fine</option>
                        <option value="salary">Salary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Amount (GH₵) *</label>
                      <input
                        type="number"
                        className="pm-input"
                        placeholder="350.00"
                        step="0.01"
                        min="0.01"
                        value={newEntryForm.amount_cedis}
                        onChange={e => setNewEntryForm({ ...newEntryForm, amount_cedis: e.target.value })}
                        required
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Payment Method</label>
                      <select
                        className="pm-select"
                        value={newEntryForm.payment_method}
                        onChange={e => setNewEntryForm({ ...newEntryForm, payment_method: e.target.value as PaymentMethod })}
                      >
                        <option value="cash">Cash</option>
                        <option value="momo_manual">MoMo (manual)</option>
                      </select>
                    </div>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Reference (optional)</label>
                    <input
                      type="text"
                      className="pm-input"
                      placeholder="Receipt or MoMo transaction ID"
                      value={newEntryForm.reference}
                      onChange={e => setNewEntryForm({ ...newEntryForm, reference: e.target.value })}
                    />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Notes (optional)</label>
                    <textarea
                      className="pm-textarea"
                      placeholder="Operational notes or route context"
                      rows={2}
                      value={newEntryForm.notes}
                      onChange={e => setNewEntryForm({ ...newEntryForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">
                  Record Entry (Pesewa Precision)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Void Reason Modal */}
      {entryToVoid && (
        <div className="pm-modal-overlay" onClick={() => setEntryToVoid(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <form onSubmit={handleConfirmVoid}>
              <div className="pm-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--pm-error)' }}>
                  <AlertTriangle size={20} />
                  <h3>Void Ledger Entry</h3>
                </div>
                <button type="button" className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setEntryToVoid(null)}>×</button>
              </div>
              <div className="pm-modal-body">
                <div style={{
                  padding: 'var(--pm-space-3) var(--pm-space-4)',
                  background: 'var(--pm-error-light)',
                  border: '1px solid var(--pm-error)',
                  borderRadius: 'var(--pm-radius-md)',
                  marginBottom: 'var(--pm-space-4)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}>
                  <strong>Immutable Audit Rule:</strong> In ProMove, ledger entries are never deleted. Voiding this entry will automatically create an audit record and a reversing adjustment entry to maintain full financial integrity.
                </div>

                <div style={{
                  background: 'var(--pm-bg-subtle)',
                  padding: 'var(--pm-space-3) var(--pm-space-4)',
                  borderRadius: 'var(--pm-radius-md)',
                  marginBottom: 'var(--pm-space-4)',
                  fontSize: '0.8125rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--pm-text-secondary)' }}>Entry Reference:</span>
                    <span style={{ fontWeight: 600 }}>#{entryToVoid.id.slice(0, 8)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--pm-text-secondary)' }}>Vehicle / Date:</span>
                    <span>{entryToVoid.vehicle?.plate_number} ({entryToVoid.entry_date})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--pm-text-secondary)' }}>Amount:</span>
                    <span style={{ fontWeight: 700 }} className="pm-text-money">
                      {formatPesewas(entryToVoid.amount_pesewas)}
                    </span>
                  </div>
                </div>

                {voidError && (
                  <div style={{
                    color: 'var(--pm-error)',
                    fontSize: '0.8125rem',
                    marginBottom: 'var(--pm-space-3)',
                    fontWeight: 500,
                  }}>
                    {voidError}
                  </div>
                )}

                <div className="pm-input-group">
                  <label className="pm-label">Mandatory Void Reason *</label>
                  <textarea
                    className="pm-textarea"
                    rows={3}
                    placeholder="Provide a required reason for reversing this record (e.g. Driver mistakenly entered double fare collection)..."
                    value={voidReason}
                    onChange={e => { setVoidReason(e.target.value); setVoidError(null); }}
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', display: 'block', marginTop: 4 }}>
                    This reason is permanently stamped onto the audit trail.
                  </span>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setEntryToVoid(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pm-btn pm-btn-primary"
                  style={{ background: 'var(--pm-error)', borderColor: 'var(--pm-error)' }}
                  disabled={!voidReason.trim()}
                >
                  Confirm Void & Create Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
