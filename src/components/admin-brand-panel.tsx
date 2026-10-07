import React from 'react';
import Link from 'next/link';
import { Server, Activity, Database, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminBrandPanel() {
  return (
    <aside className="pm-login-brand-panel" aria-label="About ProMove Enterprise Administration" style={{ backgroundColor: '#071118', borderRight: '1px solid #1E3A4D' }}>
      {/* Top Brand Header */}
      <div className="pm-auth-brand-header">
        <Link href="/" className="pm-auth-brand-logo-link" aria-label="ProMove home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ProMove Logo"
            className="pm-auth-brand-logo-icon"
          />
          <div className="pm-auth-brand-logo-text">
            <span className="pm-auth-brand-title">ProMove</span>
            <span className="pm-auth-brand-subtitle" style={{ color: '#3A96B5' }}>Enterprise Console</span>
          </div>
        </Link>
        <span className="pm-auth-brand-version-pill" style={{ backgroundColor: 'rgba(212, 160, 36, 0.15)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          Restricted Portal
        </span>
      </div>

      {/* Main Content & Architecture Pillars */}
      <div className="pm-auth-brand-content" style={{ marginTop: 'var(--pm-space-6)' }}>
        <h1 style={{ fontSize: '1.375rem', lineHeight: 1.3, fontWeight: 700, color: '#F4F7F9', letterSpacing: '-0.02em' }}>
          Platform Infrastructure and Telematics Operations
        </h1>
        <p style={{ color: '#9BB0BD', fontSize: '0.8125rem', lineHeight: 1.5, marginTop: '8px' }}>
          Authorized console for system diagnostics, Traccar telematics routing, multi-tenant Postgres governance, and platform audit logs.
        </p>

        <div className="pm-auth-features-list" style={{ marginTop: 'var(--pm-space-6)' }}>
          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon" style={{ backgroundColor: 'rgba(58, 150, 181, 0.15)', color: '#3A96B5' }}>
              <Server size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>Multi-Tenant Postgres Governance</h4>
              <p>Row-Level Security (RLS) partition audits across all registered tenant organisations.</p>
            </div>
          </div>

          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon" style={{ backgroundColor: 'rgba(58, 150, 181, 0.15)', color: '#3A96B5' }}>
              <Activity size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>Traccar Hardware Telematics Hub</h4>
              <p>Direct inspection of raw GPS NMEA packet feeds, battery status, and device IMEI registrations.</p>
            </div>
          </div>

          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon" style={{ backgroundColor: 'rgba(58, 150, 181, 0.15)', color: '#3A96B5' }}>
              <KeyRound size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>Clerk RBAC and Security Key Enforcement</h4>
              <p>Restricted to users explicitly assigned the platform_admin role with hardware 2FA.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Tenancy Footer */}
      <div className="pm-auth-brand-footer" style={{ marginTop: 'auto', paddingTop: 'var(--pm-space-6)' }}>
        <span className="pm-auth-brand-footer-item">
          <Database size={13} style={{ color: '#3A96B5' }} />
          Postgres RLS Enforced
        </span>
        <span className="pm-auth-brand-footer-item">
          <CheckCircle2 size={13} style={{ color: '#2D8A56' }} />
          Audit Trail Logged
        </span>
      </div>
    </aside>
  );
}
