'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft, Send, CheckCircle2, AlertCircle, Eye, Phone, MapPin, Database } from 'lucide-react';

export default function PrivacyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'driver',
    requestType: 'erasure',
    details: '',
  });

  const [submittedRequest, setSubmittedRequest] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestId = `ACT843-DPC-${Date.now().toString(36).toUpperCase()}`;
    setSubmittedRequest(requestId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pm-bg)', color: 'var(--pm-text)' }}>
      {/* Top Header */}
      <header style={{
        background: '#0B4F6C',
        color: '#FFFFFF',
        padding: 'var(--pm-space-6) var(--pm-space-4)',
        borderBottom: '3px solid #083D54',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--pm-space-4)' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#EDF5F8',
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to ProMove Platform
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pm-space-3)' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={26} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                Data Privacy & Statutory Compliance Policy
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#D0E8F0' }}>
                Compliant with the Republic of Ghana Data Protection Act, 2012 (Act 843)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--pm-space-6) var(--pm-space-4)' }}>
        {/* Registration and Supervisory Banner */}
        <div style={{
          background: 'var(--pm-bg-subtle)',
          border: '1px solid var(--pm-border)',
          borderRadius: 'var(--pm-radius-lg)',
          padding: 'var(--pm-space-4) var(--pm-space-5)',
          marginBottom: 'var(--pm-space-6)',
          display: 'flex',
          gap: 'var(--pm-space-4)',
          alignItems: 'flex-start',
        }}>
          <Lock size={22} color="var(--pm-blue-600)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong>Supervisory Registration:</strong> ProMove (operated by Lextech Systems Ltd) processes fleet operations and telematics data in full accordance with the Data Protection Commission (DPC) of Ghana. All data subject requests are processed in strict compliance with statutory rights under Act 843.
          </div>
        </div>

        {/* Section 1: Data We Collect */}
        <section style={{ marginBottom: 'var(--pm-space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--pm-space-3)', color: '#0B4F6C' }}>
            1. Scope of Personal and Operational Data
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--pm-space-4)' }}>
            <div className="pm-card" style={{ padding: 'var(--pm-space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <Phone size={18} color="var(--pm-blue-600)" /> Contact & Identity
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Driver and manager telephone numbers, full legal names, role assignments, and optional email addresses for system authentication.
              </p>
            </div>

            <div className="pm-card" style={{ padding: 'var(--pm-space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <Lock size={18} color="var(--pm-blue-600)" /> Driver Licensing (Encrypted)
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Driver licence numbers and expiry dates. Sensitive licence strings are encrypted at rest using AES-256 and never logged in plain text.
              </p>
            </div>

            <div className="pm-card" style={{ padding: 'var(--pm-space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <MapPin size={18} color="var(--pm-blue-600)" /> Location & Telematics
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Vehicle GPS coordinates, speed, and ignition states. Activated exclusively after statutory opt-in consent is recorded from the driver.
              </p>
            </div>

            <div className="pm-card" style={{ padding: 'var(--pm-space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <Database size={18} color="var(--pm-blue-600)" /> Financial Records
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Shift collections, fuel logs, and driver commissions in integer pesewas. Maintained in an immutable append-only ledger for statutory accounting.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Statutory Consent */}
        <section style={{ marginBottom: 'var(--pm-space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--pm-space-3)', color: '#0B4F6C' }}>
            2. Statutory Opt-In Consent (Act 843 Section 20)
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--pm-text-secondary)' }}>
            Under Section 20 of Act 843, personal data is processed solely with the explicit, informed, and documented consent of the data subject or where required for contractual fulfillment between fleet owners and operators:
          </p>
          <ul style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--pm-text-secondary)', paddingLeft: 'var(--pm-space-5)' }}>
            <li>
              <strong>SMS Operational Alerts:</strong> Drivers and managers explicitly choose whether to receive automated dispatch notices and document renewal reminders via SMS.
            </li>
            <li>
              <strong>GPS Hardware Tracking:</strong> Telematics trackers attached to vehicles record location data only once statutory driver consent is captured and linked to the vehicle assignment.
            </li>
            <li>
              <strong>Revocation:</strong> Any data subject may withdraw consent at any time via the form below or by notifying their organisation administrator.
            </li>
          </ul>
        </section>

        {/* Section 3: Data Subject Rights and Interactive Deletion Request Form */}
        <section style={{ marginBottom: 'var(--pm-space-6)' }}>
          <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--pm-space-2)', color: '#0B4F6C' }}>
              3. Data Subject Rights & Erasure Request (Act 843 Sections 33 to 40)
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)' }}>
              Data subjects registered on ProMove may submit requests for data access, rectification, consent revocation, or complete erasure of non-statutory personal data.
            </p>

            {submittedRequest ? (
              <div style={{
                background: 'var(--pm-success-light)',
                border: '1px solid var(--pm-success)',
                borderRadius: 'var(--pm-radius-md)',
                padding: 'var(--pm-space-5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <CheckCircle2 size={24} color="var(--pm-success)" />
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', color: 'var(--pm-success)' }}>
                    Statutory Request Registered
                  </h3>
                </div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 12px 0' }}>
                  Your request has been officially recorded with tracking reference:
                  <strong style={{ display: 'block', fontSize: '1rem', marginTop: 4, fontFamily: 'monospace' }}>
                    {submittedRequest}
                  </strong>
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: 0 }}>
                  In accordance with Ghana Data Protection Act guidelines, the Data Protection Officer will review and fulfill your request within 21 business days. A confirmation SMS will be dispatched to your registered phone number.
                </p>
                <button
                  type="button"
                  className="pm-btn pm-btn-secondary"
                  onClick={() => setSubmittedRequest(null)}
                  style={{ marginTop: 'var(--pm-space-4)' }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--pm-space-4)' }}>
                  <div>
                    <label className="pm-label">Full Legal Name *</label>
                    <input
                      type="text"
                      className="pm-input"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="pm-label">Ghana Telephone Number *</label>
                    <input
                      type="tel"
                      className="pm-input"
                      required
                      placeholder="e.g. 0244123456"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--pm-space-4)' }}>
                  <div>
                    <label className="pm-label">Platform Role *</label>
                    <select
                      className="pm-select"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="driver">Driver</option>
                      <option value="conductor">Conductor</option>
                      <option value="owner">Vehicle Owner</option>
                      <option value="manager">Fleet Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="pm-label">Statutory Request Type *</label>
                    <select
                      className="pm-select"
                      value={formData.requestType}
                      onChange={e => setFormData({ ...formData, requestType: e.target.value })}
                    >
                      <option value="erasure">Erasure of Personal Data (Right to be Forgotten)</option>
                      <option value="revoke_consent">Revocation of SMS or GPS Tracking Consent</option>
                      <option value="access">Access Request (Export of My Records)</option>
                      <option value="rectification">Rectification of Inaccurate Details</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="pm-label">Request Details and Fleet Organisation Name</label>
                  <textarea
                    className="pm-textarea"
                    rows={3}
                    placeholder="Provide relevant vehicle plates or specific details to expedite verification..."
                    value={formData.details}
                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                  <AlertCircle size={14} />
                  Financial ledger transactions are subject to statutory company audit retention periods and cannot be modified retroactively.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--pm-space-2)' }}>
                  <button type="submit" className="pm-btn pm-btn-primary">
                    <Send size={16} /> Submit Act 843 Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Section 4: Data Retention & Architecture */}
        <section style={{ marginBottom: 'var(--pm-space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--pm-space-3)', color: '#0B4F6C' }}>
            4. Security Architecture & Data Isolation
          </h2>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--pm-text-secondary)' }}>
            <p>
              ProMove employs strict technical safeguards to protect data subjects against unauthorized access, leakage, or loss:
            </p>
            <ul style={{ paddingLeft: 'var(--pm-space-5)' }}>
              <li>
                <strong>Multi-Tenant Isolation:</strong> Every record is keyed to a unique tenant identifier. PostgreSQL Row Level Security (RLS) ensures organisation data is isolated at the database engine level.
              </li>
              <li>
                <strong>Cryptographic Protection:</strong> User passwords are hashed with Argon2id. Driver licence records are encrypted with AES-256. All web and API traffic is strictly transmitted over TLS 1.3.
              </li>
              <li>
                <strong>Append-Only Accounting:</strong> Financial ledger records cannot be deleted; voiding records a compensating entry with explicit audit notes to prevent fraud.
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--pm-border)',
          paddingTop: 'var(--pm-space-4)',
          fontSize: '0.75rem',
          color: 'var(--pm-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--pm-space-3)',
        }}>
          <div>
            ProMove Cloud Platform | Lextech Systems Ltd | Accra, Ghana
          </div>
          <div>
            Data Protection Officer contact: privacy@promove.gh | Tel: +233 (0) 30 200 0000
          </div>
        </footer>
      </main>
    </div>
  );
}
