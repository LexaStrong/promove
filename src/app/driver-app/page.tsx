'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car, Plus, Fuel, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Wifi, WifiOff, RefreshCw, CheckCircle2, Clock, Camera,
  MapPin, ShieldAlert, ArrowLeft, LogOut, Phone
} from 'lucide-react';
import { formatPesewas } from '@/lib/types';

interface OfflineQueueItem {
  id: string;
  type: 'income' | 'expense' | 'incident';
  title: string;
  amount_pesewas?: number;
  time: string;
  status: 'synced' | 'pending';
}

export default function DriverAppPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Active Modals
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'fault' | null>(null);

  // Form states
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeMethod, setIncomeMethod] = useState<'cash' | 'momo_manual'>('cash');
  const [incomeNotes, setIncomeNotes] = useState('');

  const [expenseType, setExpenseType] = useState<'fuel' | 'toll' | 'repair' | 'other'>('fuel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [fuelLitres, setFuelLitres] = useState('');
  const [fuelStation, setFuelStation] = useState('Goil');

  const [faultType, setFaultType] = useState('puncture');
  const [faultLocation, setFaultLocation] = useState('Near Kwame Nkrumah Circle');
  const [faultSeverity, setFaultSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [faultNotes, setFaultNotes] = useState('');

  // Shift entries
  const [entries, setEntries] = useState<OfflineQueueItem[]>([
    {
      id: 'd-1',
      type: 'income',
      title: 'Morning Shift Fare Collection',
      amount_pesewas: 18000,
      time: '08:30 AM',
      status: 'synced',
    },
    {
      id: 'd-2',
      type: 'expense',
      title: 'Goil Fuel Top-up (15L)',
      amount_pesewas: 18500,
      time: '09:15 AM',
      status: 'synced',
    },
    {
      id: 'd-3',
      type: 'income',
      title: 'Accra - Tema Roundtrip Collection',
      amount_pesewas: 22000,
      time: '12:45 PM',
      status: 'synced',
    },
  ]);

  const pendingCount = entries.filter(e => e.status === 'pending').length;

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setEntries(prev => prev.map(e => ({ ...e, status: 'synced' as const })));
      setSyncing(false);
    }, 1200);
  };

  const handleLogIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(incomeAmount);
    if (!amountVal || isNaN(amountVal)) return;

    const newEntry: OfflineQueueItem = {
      id: `inc-${Date.now()}`,
      type: 'income',
      title: `Sales Collection (${incomeMethod === 'cash' ? 'Cash' : 'MoMo'})`,
      amount_pesewas: Math.round(amountVal * 100),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'synced' : 'pending',
    };

    setEntries(prev => [newEntry, ...prev]);
    setIncomeAmount('');
    setIncomeNotes('');
    setActiveModal(null);
  };

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseAmount);
    if (!amountVal || isNaN(amountVal)) return;

    const label = expenseType === 'fuel'
      ? `${fuelStation} Fuel (${fuelLitres || '0'}L)`
      : `Expense: ${expenseType.toUpperCase()}`;

    const newEntry: OfflineQueueItem = {
      id: `exp-${Date.now()}`,
      type: 'expense',
      title: label,
      amount_pesewas: Math.round(amountVal * 100),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'synced' : 'pending',
    };

    setEntries(prev => [newEntry, ...prev]);
    setExpenseAmount('');
    setFuelLitres('');
    setActiveModal(null);
  };

  const handleReportFault = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: OfflineQueueItem = {
      id: `flt-${Date.now()}`,
      type: 'incident',
      title: `Reported ${faultType.toUpperCase()} at ${faultLocation}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'synced' : 'pending',
    };

    setEntries(prev => [newEntry, ...prev]);
    setFaultNotes('');
    setActiveModal(null);
  };

  // Calculations
  const totalIncomePesewas = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + (e.amount_pesewas || 0), 0);

  const totalExpensePesewas = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + (e.amount_pesewas || 0), 0);

  const netPesewas = totalIncomePesewas - totalExpensePesewas;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--pm-bg-subtle)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 520,
      margin: '0 auto',
      boxShadow: 'var(--pm-shadow-md)',
      position: 'relative',
    }}>
      {/* Top Mobile Bar */}
      <div style={{
        background: 'var(--pm-blue-700)',
        color: '#FFFFFF',
        padding: 'var(--pm-space-4) var(--pm-space-5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--pm-radius-full)',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem'
            }}>
              KA
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Kwame Asante</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Assigned Driver</div>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            style={{
              background: isOnline ? 'rgba(45, 138, 86, 0.3)' : 'rgba(232, 99, 74, 0.3)',
              border: `1px solid ${isOnline ? 'var(--pm-success)' : 'var(--pm-error)'}`,
              color: '#FFFFFF',
              borderRadius: 'var(--pm-radius-full)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Assigned Vehicle Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--pm-radius-md)',
          padding: 'var(--pm-space-3) var(--pm-space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Current Vehicle</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>
              GR 1234-22
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              Toyota HiAce (Trotro) • Accra - Tema
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Daily Target</div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>GH₵ 350.00</div>
            <div style={{ fontSize: '0.6875rem', opacity: 0.85 }}>20% Commission</div>
          </div>
        </div>
      </div>

      {/* Sync Status Banner if offline or pending */}
      {(!isOnline || pendingCount > 0) && (
        <div style={{
          background: isOnline ? 'var(--pm-warning-light)' : 'var(--pm-error-light)',
          color: isOnline ? 'var(--pm-warning)' : 'var(--pm-error)',
          padding: '8px var(--pm-space-4)',
          fontSize: '0.8125rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--pm-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOnline ? <Clock size={15} /> : <WifiOff size={15} />}
            <span>{pendingCount} records waiting to sync</span>
          </div>
          {isOnline && pendingCount > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="pm-btn pm-btn-secondary pm-btn-sm"
              style={{ height: 26, fontSize: '0.75rem', padding: '0 8px' }}
            >
              <RefreshCw size={12} className={syncing ? 'pm-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>
      )}

      {/* Main Body */}
      <div style={{ padding: 'var(--pm-space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
        {/* Shift Money Summary */}
        <div className="pm-card" style={{ padding: 'var(--pm-space-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Today&apos;s Shift Totals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
            <div style={{ background: 'var(--pm-bg-subtle)', padding: 8, borderRadius: 'var(--pm-radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-secondary)' }}>Income</div>
              <div style={{ fontWeight: 700, color: 'var(--pm-success)', fontSize: '0.9375rem', marginTop: 2 }}>
                {formatPesewas(totalIncomePesewas)}
              </div>
            </div>
            <div style={{ background: 'var(--pm-bg-subtle)', padding: 8, borderRadius: 'var(--pm-radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-secondary)' }}>Expenses</div>
              <div style={{ fontWeight: 700, color: 'var(--pm-error)', fontSize: '0.9375rem', marginTop: 2 }}>
                {formatPesewas(totalExpensePesewas)}
              </div>
            </div>
            <div style={{ background: 'var(--pm-bg-subtle)', padding: 8, borderRadius: 'var(--pm-radius-md)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-secondary)' }}>Net Handover</div>
              <div style={{ fontWeight: 700, color: 'var(--pm-blue-600)', fontSize: '0.9375rem', marginTop: 2 }}>
                {formatPesewas(netPesewas)}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Big Tactile Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
          <button
            onClick={() => setActiveModal('income')}
            className="pm-btn"
            style={{
              padding: '16px',
              background: 'var(--pm-success)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--pm-radius-lg)',
              boxShadow: 'var(--pm-shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ArrowUpRight size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Log Daily Sales / Income</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Record cash or MoMo fares received</div>
              </div>
            </div>
            <Plus size={20} />
          </button>

          <button
            onClick={() => setActiveModal('expense')}
            className="pm-btn"
            style={{
              padding: '16px',
              background: 'var(--pm-blue-600)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--pm-radius-lg)',
              boxShadow: 'var(--pm-shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Fuel size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Log Fuel / Expense</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Record petrol, diesel, tolls, or minor repair</div>
              </div>
            </div>
            <Plus size={20} />
          </button>

          <button
            onClick={() => setActiveModal('fault')}
            className="pm-btn"
            style={{
              padding: '16px',
              background: '#9B2C2C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--pm-radius-lg)',
              boxShadow: 'var(--pm-shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--pm-radius-md)',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Report Fault / Breakdown</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Alert vehicle owner and roadside assistance</div>
              </div>
            </div>
            <ShieldAlert size={20} />
          </button>
        </div>

        {/* Activity Feed for Shift */}
        <div className="pm-card" style={{ marginTop: 'var(--pm-space-2)' }}>
          <div style={{
            padding: 'var(--pm-space-3) var(--pm-space-4)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Shift Activity</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{entries.length} items logged</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {entries.map(item => (
              <div
                key={item.id}
                style={{
                  padding: 'var(--pm-space-3) var(--pm-space-4)',
                  borderBottom: '1px solid var(--pm-border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--pm-radius-full)',
                    background: item.type === 'income'
                      ? 'var(--pm-success-light)'
                      : item.type === 'expense'
                      ? 'var(--pm-error-light)'
                      : 'var(--pm-warning-light)',
                    color: item.type === 'income'
                      ? 'var(--pm-success)'
                      : item.type === 'expense'
                      ? 'var(--pm-error)'
                      : 'var(--pm-warning)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.type === 'income' ? <ArrowUpRight size={16} /> : item.type === 'expense' ? <ArrowDownRight size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{item.time}</span>
                      <span>•</span>
                      {item.status === 'synced' ? (
                        <span style={{ color: 'var(--pm-success)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CheckCircle2 size={10} /> Synced
                        </span>
                      ) : (
                        <span style={{ color: 'var(--pm-warning)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Clock size={10} /> Queued
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {item.amount_pesewas !== undefined && (
                  <div style={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: item.type === 'income' ? 'var(--pm-success)' : 'var(--pm-text)'
                  }}>
                    {item.type === 'income' ? '+' : '-'} {formatPesewas(item.amount_pesewas)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back Link to Fleet Manager */}
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 'var(--pm-space-4)' }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pm-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={14} /> Back to Fleet Owner Dashboard
          </Link>
        </div>
      </div>

      {/* Modal 1: Log Income */}
      {activeModal === 'income' && (
        <div className="pm-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="pm-modal-header">
              <h2>Record Fare Income</h2>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleLogIncome}>
              <div className="pm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Amount in Cedis (GH₵) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="pm-input"
                    placeholder="e.g. 150.00"
                    value={incomeAmount}
                    onChange={e => setIncomeAmount(e.target.value)}
                    autoFocus
                    required
                  />
                  {incomeAmount && !isNaN(parseFloat(incomeAmount)) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4 }}>
                      Exact ledger value: {Math.round(parseFloat(incomeAmount) * 100)} pesewas
                    </div>
                  )}
                </div>

                <div>
                  <label className="pm-form-label">Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      className={`pm-btn ${incomeMethod === 'cash' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
                      onClick={() => setIncomeMethod('cash')}
                    >
                      Physical Cash
                    </button>
                    <button
                      type="button"
                      className={`pm-btn ${incomeMethod === 'momo_manual' ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
                      onClick={() => setIncomeMethod('momo_manual')}
                    >
                      MoMo Transfer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="pm-form-label">Trip Notes / Route (Optional)</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="e.g. 3rd trip Madina to Accra"
                    value={incomeNotes}
                    onChange={e => setIncomeNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn-primary" style={{ background: 'var(--pm-success)' }}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Expense */}
      {activeModal === 'expense' && (
        <div className="pm-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="pm-modal-header">
              <h2>Log Expense / Fuel</h2>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleLogExpense}>
              <div className="pm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Expense Category</label>
                  <select
                    className="pm-select"
                    value={expenseType}
                    onChange={e => setExpenseType(e.target.value as 'fuel' | 'toll' | 'repair' | 'other')}
                  >
                    <option value="fuel">Fuel (Petrol/Diesel)</option>
                    <option value="toll">Road Toll / Station Levy</option>
                    <option value="repair">Emergency Vulcanizer / Tyre</option>
                    <option value="other">Other Operational Cost</option>
                  </select>
                </div>

                <div>
                  <label className="pm-form-label">Amount in Cedis (GH₵) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="pm-input"
                    placeholder="e.g. 80.00"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {expenseType === 'fuel' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label className="pm-form-label">Litres</label>
                      <input
                        type="number"
                        step="0.1"
                        className="pm-input"
                        placeholder="e.g. 12"
                        value={fuelLitres}
                        onChange={e => setFuelLitres(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="pm-form-label">Station</label>
                      <select
                        className="pm-select"
                        value={fuelStation}
                        onChange={e => setFuelStation(e.target.value)}
                      >
                        <option value="Goil">GOIL</option>
                        <option value="Total">TotalEnergies</option>
                        <option value="Shell">Shell</option>
                        <option value="Allied">Allied</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={{
                  border: '1px dashed var(--pm-border)',
                  borderRadius: 'var(--pm-radius-md)',
                  padding: 'var(--pm-space-3)',
                  textAlign: 'center',
                  background: 'var(--pm-bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.8125rem',
                  color: 'var(--pm-text-secondary)'
                }}>
                  <Camera size={16} /> Snap Receipt Photo (Optional)
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Report Fault */}
      {activeModal === 'fault' && (
        <div className="pm-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="pm-modal-header">
              <h2>Report Vehicle Fault</h2>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleReportFault}>
              <div className="pm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Fault Type</label>
                  <select
                    className="pm-select"
                    value={faultType}
                    onChange={e => setFaultType(e.target.value)}
                  >
                    <option value="puncture">Tyre Puncture / Blowout</option>
                    <option value="engine_overheat">Engine Overheating / Radiator</option>
                    <option value="brakes">Brake Issue</option>
                    <option value="alternator">Battery / Alternator</option>
                    <option value="police_inspection">Police / Station Inspection Delay</option>
                  </select>
                </div>

                <div>
                  <label className="pm-form-label">Current Location *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                    }} />
                    <input
                      type="text"
                      className="pm-input"
                      style={{ paddingLeft: 38 }}
                      value={faultLocation}
                      onChange={e => setFaultLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="pm-form-label">Severity Level</label>
                  <select
                    className="pm-select"
                    value={faultSeverity}
                    onChange={e => setFaultSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low (Vehicle still drivable)</option>
                    <option value="medium">Medium (Requires attention soon)</option>
                    <option value="high">High (Vehicle stopped / cannot move)</option>
                  </select>
                </div>

                <div>
                  <label className="pm-form-label">Fault Description</label>
                  <textarea
                    className="pm-textarea"
                    rows={2}
                    placeholder="Describe what happened..."
                    value={faultNotes}
                    onChange={e => setFaultNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn-primary" style={{ background: 'var(--pm-error)' }}>
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
