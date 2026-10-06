import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, MapPin, Fuel, Database } from 'lucide-react';

interface AuthBrandPanelProps {
  mode?: 'login' | 'register';
}

export default function AuthBrandPanel({ mode = 'login' }: AuthBrandPanelProps) {
  const isRegister = mode === 'register';

  return (
    <aside className="pm-login-brand-panel" aria-label="About ProMove">
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
            <span className="pm-auth-brand-subtitle">Fleet Control</span>
          </div>
        </Link>
        <span className="pm-auth-brand-version-pill">Ghana • v1.0</span>
      </div>

      {/* Hero Showcase Vehicle Card */}
      <div className="pm-auth-brand-showcase">
        <picture className="pm-login-splash">
          <source media="(max-width: 640px)" srcSet="/onboarding-splash-mobile.png" />
          <img
            src="/onboarding-splash-desktop.png"
            alt="ProMove commercial fleet vehicles in Ghana"
            fetchPriority="high"
          />
        </picture>
        <div className="pm-auth-brand-badge">
          <span className="pm-auth-live-dot" />
          <span>Active GPS Telematics • 16 Regions</span>
        </div>
      </div>

      {/* Main Content & Value Pillars */}
      <div className="pm-auth-brand-content">
        <h1>
          {isRegister ? 'Scale Your Fleet with Digital Precision' : "Ghana's Operating System for Fleets"}
        </h1>
        <p>
          {isRegister
            ? 'Set up your organization workspace in minutes. Eliminate paper logs, track daily cashflow, and monitor vehicles live across all major transit corridors.'
            : 'Real-time visibility, automated daily income ledger, and complete DVLA compliance for transport owners and managers.'}
        </p>

        <div className="pm-auth-features-list">
          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon">
              <MapPin size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>Live Corridors & Geo-Tracking</h4>
              <p>Trotro, taxi, bus, and truck tracking with offline cellular sync.</p>
            </div>
          </div>

          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon">
              <Fuel size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>Daily MoMo & Ledger Reconciliations</h4>
              <p>Accurate driver revenue audit trail with instant payment logs.</p>
            </div>
          </div>

          <div className="pm-auth-feature-item">
            <div className="pm-auth-feature-icon">
              <ShieldCheck size={16} />
            </div>
            <div className="pm-auth-feature-text">
              <h4>DVLA & Roadworthy Expiry Radar</h4>
              <p>Proactive reminders before insurance, stickers, or inspections lapse.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Tenancy Footer */}
      <div className="pm-auth-brand-footer">
        <span className="pm-auth-brand-footer-item">
          <Database size={13} style={{ color: '#A1D0E0' }} />
          Tenant Data Isolation (Postgres RLS)
        </span>
        <span className="pm-auth-brand-footer-item">
          <CheckCircle2 size={13} style={{ color: '#2D8A56' }} />
          Audit Trail Active
        </span>
      </div>
    </aside>
  );
}