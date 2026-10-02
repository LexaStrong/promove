'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Upload, AlertTriangle } from 'lucide-react';
import { mockDocuments, mockVehicles } from '@/lib/mock-data';

export default function DocumentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const expired = mockDocuments.filter(d => (d.days_until_expiry ?? 999) <= 0);
  const urgent = mockDocuments.filter(d => (d.days_until_expiry ?? 999) > 0 && (d.days_until_expiry ?? 999) <= 7);
  const warning = mockDocuments.filter(d => (d.days_until_expiry ?? 999) > 7 && (d.days_until_expiry ?? 999) <= 30);
  const ok = mockDocuments.filter(d => (d.days_until_expiry ?? 999) > 30);

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
          <div className="pm-stat-value">{mockDocuments.length}</div>
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
                  <Link href={`/vehicles/${doc.vehicle_id}`}>{doc.vehicle?.plate_number}</Link>
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
            {mockDocuments.map(doc => (
              <tr key={doc.id}>
                <td style={{ fontWeight: 500 }}>
                  <Link href={`/vehicles/${doc.vehicle_id}`}>{doc.vehicle?.plate_number}</Link>
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

      {showAddModal && (
        <div className="pm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3>Add Document</h3>
              <button className="pm-btn pm-btn-ghost pm-btn-icon" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="pm-modal-body">
              <div className="pm-form-group">
                <div className="pm-input-group">
                  <label className="pm-label">Vehicle</label>
                  <select className="pm-select">
                    <option value="">Select vehicle</option>
                    {mockVehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Document Type</label>
                    <select className="pm-select">
                      <option value="insurance">Insurance</option>
                      <option value="roadworthy">Roadworthy</option>
                      <option value="registration">Registration</option>
                      <option value="permit">Permit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Document Number</label>
                    <input type="text" className="pm-input" placeholder="e.g. INS-2026-1234" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                  <div className="pm-input-group">
                    <label className="pm-label">Issued On</label>
                    <input type="date" className="pm-input" />
                  </div>
                  <div className="pm-input-group">
                    <label className="pm-label">Expires On</label>
                    <input type="date" className="pm-input" />
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
              <button className="pm-btn pm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={() => setShowAddModal(false)}>Add Document</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
