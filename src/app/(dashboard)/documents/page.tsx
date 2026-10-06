'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Upload, AlertTriangle, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFleet } from '@/lib/fleet-context';
import { DocType } from '@/lib/types';

export default function DocumentsPage() {
  const { role } = useAuth();
  const { documents, vehicles, addDocument } = useFleet();
  const isAdmin = role === 'platform_admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    vehicle_id: string;
    doc_type: DocType;
    doc_number: string;
    issued_on: string;
    expires_on: string;
  }>({
    vehicle_id: '',
    doc_type: 'insurance',
    doc_number: '',
    issued_on: '',
    expires_on: '',
  });

  // Requirement 3: Documents are strictly confidential to owners and drivers; inaccessible to admins
  if (isAdmin) {
    return (
      <div className="pm-container" style={{ padding: 'var(--pm-space-8) 0' }}>
        <div className="pm-card" style={{
          padding: 'var(--pm-space-8)',
          maxWidth: 680,
          margin: '0 auto',
          textAlign: 'center',
          borderTop: '4px solid var(--pm-error)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--pm-radius-full)',
            background: 'var(--pm-error-light)', color: 'var(--pm-error)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--pm-space-4)'
          }}>
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--pm-space-2)' }}>
            Confidential Vehicle Documents
          </h2>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--pm-error-light)', color: 'var(--pm-error)',
            padding: '4px 10px', borderRadius: 'var(--pm-radius-full)',
            fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--pm-space-4)'
          }}>
            <ShieldAlert size={14} /> Owner & Driver Confidential Access Only
          </div>

          <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 'var(--pm-space-5)' }}>
            Under ProMove Privacy & Tenancy Isolation Policy (Ghana Data Protection Act 2012, Act 843),
            all vehicle ownership titles, DVLA registration certificates, roadworthy renewals, insurance policies,
            and police permits are strictly confidential.
          </p>

          <div style={{
            background: 'var(--pm-bg-subtle)',
            borderRadius: 'var(--pm-radius-md)',
            padding: 'var(--pm-space-4)',
            textAlign: 'left',
            fontSize: '0.8125rem',
            color: 'var(--pm-text-secondary)',
            marginBottom: 'var(--pm-space-6)',
            border: '1px solid var(--pm-border)',
          }}>
            <strong>Policy Enactment:</strong> Administrative personnel and platform administrators are legally barred
            from viewing or downloading private vehicle documentation to prevent administrative data leakage and maintain
            sovereign owner data confidentiality. Only verified vehicle owners and assigned drivers hold authorization to view records.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy" className="pm-btn pm-btn-secondary">
              Review App Policies (Act 843)
            </Link>
            <Link href="/dashboard" className="pm-btn pm-btn-primary">
              <ArrowLeft size={16} /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expired = documents.filter(d => (d.days_until_expiry ?? 999) <= 0);
  const urgent = documents.filter(d => (d.days_until_expiry ?? 999) > 0 && (d.days_until_expiry ?? 999) <= 7);
  const warning = documents.filter(d => (d.days_until_expiry ?? 999) > 7 && (d.days_until_expiry ?? 999) <= 30);
  const ok = documents.filter(d => (d.days_until_expiry ?? 999) > 30);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id) {
      alert('Please select a vehicle');
      return;
    }
    addDocument({
      vehicle_id: formData.vehicle_id,
      doc_type: formData.doc_type,
      doc_number: formData.doc_number || null,
      issued_on: formData.issued_on || null,
      expires_on: formData.expires_on || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    });
    setFormData({
      vehicle_id: '',
      doc_type: 'insurance',
      doc_number: '',
      issued_on: '',
      expires_on: '',
    });
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Vehicle Documents</h1>
          <p className="pm-page-subtitle">Insurance, roadworthy, registration, and permits</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Document
        </button>
      </div>

      <div className="pm-grid-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Total Documents</div>
          <div className="pm-stat-value">{documents.length}</div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Expired</div>
          <div className="pm-stat-value" style={{ color: expired.length > 0 ? 'var(--pm-error)' : 'var(--pm-success)' }}>
            {expired.length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Expiring Within 7 Days</div>
          <div className="pm-stat-value" style={{ color: urgent.length > 0 ? 'var(--pm-error)' : 'var(--pm-text)' }}>
            {urgent.length}
          </div>
        </div>
        <div className="pm-card pm-stat">
          <div className="pm-stat-label">Expiring Within 30 Days</div>
          <div className="pm-stat-value" style={{ color: warning.length > 0 ? 'var(--pm-warning)' : 'var(--pm-text)' }}>
            {warning.length}
          </div>
        </div>
      </div>

      {/* Urgent alerts */}
      {(expired.length > 0 || urgent.length > 0) && (
        <div className="pm-card" style={{
          padding: 'var(--pm-space-4) var(--pm-space-5)', marginBottom: 'var(--pm-space-4)',
          borderLeft: '3px solid var(--pm-error)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--pm-error)', marginBottom: 8 }}>
            <AlertTriangle size={18} /> Immediate Attention Required
          </div>
          {[...expired, ...urgent].map(doc => (
            <div key={doc.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0', borderBottom: '1px solid var(--pm-border-subtle)',
              fontSize: '0.875rem',
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>
                  <Link href={`/vehicles/${doc.vehicle_id}`}>{doc.vehicle?.plate_number || 'Vehicle'}</Link>
                </span>
                {' • '}
                <span style={{ textTransform: 'capitalize' }}>{doc.doc_type}</span>
              </div>
              <span className={`pm-badge ${(doc.days_until_expiry ?? 999) <= 0 ? 'pm-badge-critical' : 'pm-badge-pending'}`}>
                {(doc.days_until_expiry ?? 999) <= 0 ? 'Expired' : `${doc.days_until_expiry} days left`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* All documents table */}
      <div className="pm-table-wrapper">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Document Type</th>
              <th>Document Number</th>
              <th>Issued On</th>
              <th>Expires On</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td style={{ fontWeight: 500 }}>
                  <Link href={`/vehicles/${doc.vehicle_id}`}>{doc.vehicle?.plate_number || 'Vehicle'}</Link>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{doc.doc_type}</td>
                <td style={{ color: 'var(--pm-text-secondary)' }}>{doc.doc_number || '-'}</td>
                <td>{doc.issued_on || '-'}</td>
                <td>{doc.expires_on}</td>
                <td>
                  <span className={`pm-badge ${
                    (doc.days_until_expiry ?? 999) <= 0 ? 'pm-badge-critical' :
                    (doc.days_until_expiry ?? 999) <= 7 ? 'pm-badge-critical' :
                    (doc.days_until_expiry ?? 999) <= 30 ? 'pm-badge-pending' :
                    'pm-badge-active'
                  }`}>
                    {(doc.days_until_expiry ?? 999) <= 0 ? 'Expired' : `${doc.days_until_expiry} days`}
                  </span>
                </td>
                <td>
                  {doc.file_url ? (
                    <a href={doc.file_url} style={{ fontSize: '0.8125rem' }}>View</a>
                  ) : (
                    <span style={{ color: 'var(--pm-text-muted)', fontSize: '0.8125rem' }}>No file</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {documents.length === 0 && (
        <div className="pm-empty" style={{ marginTop: 'var(--pm-space-6)' }}>
          <div className="pm-empty-icon"><FileText size={28} /></div>
          <div className="pm-empty-title">No documents uploaded yet</div>
          <div className="pm-empty-desc">
            Track roadworthy renewals, insurance policies, and DVLA permits for your fleet.
          </div>
          <button className="pm-btn pm-btn-primary" style={{ marginTop: 'var(--pm-space-4)' }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add First Document
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>Add Document</h3>
              <button className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="pm-modal-body">
                <div className="pm-form-group">
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Document Type</label>
                      <select
                        className="pm-select"
                        value={formData.doc_type}
                        onChange={e => setFormData({ ...formData, doc_type: e.target.value as DocType })}
                      >
                        <option value="insurance">Insurance</option>
                        <option value="roadworthy">Roadworthy</option>
                        <option value="registration">Registration</option>
                        <option value="permit">Permit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Document Number</label>
                      <input
                        type="text"
                        className="pm-input"
                        placeholder="e.g. INS-2026-1234"
                        value={formData.doc_number}
                        onChange={e => setFormData({ ...formData, doc_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                    <div className="pm-input-group">
                      <label className="pm-label">Issued On</label>
                      <input
                        type="date"
                        className="pm-input"
                        value={formData.issued_on}
                        onChange={e => setFormData({ ...formData, issued_on: e.target.value })}
                      />
                    </div>
                    <div className="pm-input-group">
                      <label className="pm-label">Expires On</label>
                      <input
                        type="date"
                        className="pm-input"
                        required
                        value={formData.expires_on}
                        onChange={e => setFormData({ ...formData, expires_on: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Upload File (optional)</label>
                    <div style={{
                      border: '2px dashed var(--pm-border)', borderRadius: 'var(--pm-radius-md)',
                      padding: 'var(--pm-space-6)', textAlign: 'center', cursor: 'pointer',
                    }}>
                      <Upload size={24} style={{ color: 'var(--pm-text-muted)', marginBottom: 8 }} />
                      <div style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)' }}>
                        Click or drag to upload a photo or PDF
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="pm-btn pm-btn-primary">Add Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
