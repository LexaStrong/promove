import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Car, Users, BookOpen, Wrench, FileText,
  BarChart3, Shield, Wifi, ArrowRight,
} from 'lucide-react';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { siteUrl } from '@/lib/site';

const features = [
  {
    icon: Car,
    title: 'Vehicle Registry',
    desc: 'Add vehicles one at a time or bulk-import an entire fleet from a spreadsheet. Track make, model, plate, type, and odometer in one place.',
  },
  /*
  {
    icon: Users,
    title: 'Driver Management',
    desc: 'Register drivers and conductors, track licence expiry, assign vehicles with commission settings, and keep a full assignment history.',
  },
  */
  {
    icon: BookOpen,
    title: 'Daily Ledger',
    desc: 'Record income, expenses, commissions, and remittances per vehicle. Void entries with a reason instead of deleting them. Every pesewa accounted for.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    desc: 'Set service intervals by distance or time. Log maintenance work with costs linked to the ledger. See what is due and what is overdue at a glance.',
  },
  {
    icon: FileText,
    title: 'Document Expiry Alerts',
    desc: 'Upload insurance, roadworthy, and registration documents. Get in-app reminders at 30, 14, and 7 days before expiry.',
  },
  {
    icon: BarChart3,
    title: 'Clear Reports',
    desc: 'Per-vehicle and per-owner summaries, weekly and monthly, with PDF export. Numbers that match the ledger to the pesewa.',
  },
  {
    icon: Wifi,
    title: 'Works Offline',
    desc: 'Record income and expenses even with no signal. Data syncs automatically when connectivity returns, with no duplicates.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    desc: 'Strict tenant isolation, TOTP two-factor login, encrypted licence numbers, and a full audit trail on every change to money, roles, and vehicles.',
  },
];

export const metadata: Metadata = {
  title: 'Fleet management for Ghanaian transport operators',
  description:
    'Manage vehicles, drivers, daily income, maintenance, documents, and fleet visibility from one operations workspace built for Ghana.',
  alternates: {
    canonical: new URL('/', siteUrl).toString(),
  },
  openGraph: {
    title: 'Fleet management for Ghanaian transport operators',
    description:
      'Manage vehicles, drivers, daily income, maintenance, documents, and fleet visibility from one operations workspace built for Ghana.',
    url: new URL('/', siteUrl).toString(),
    images: [{
      url: '/auth-splash-desktop.png',
      alt: 'ProMove fleet vehicles on a scenic road',
    }],
  },
};

export default function LandingPage() {
  return (
    <div>
      {/* Nav */}
      <nav className="pm-landing-nav">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/promove-logo-lockup.png"
          alt="ProMove Fleet Control"
          className="pm-brand-lockup pm-brand-lockup-landing"
          style={{ width: 200, maxWidth: '40%', height: 'auto', flexShrink: 0 }}
        />
        <div className="pm-landing-nav-actions">
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button type="button" className="pm-btn pm-btn-ghost">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button type="button" className="pm-btn pm-btn-primary">Get started</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="pm-btn pm-btn-secondary" style={{ marginRight: 8 }}>
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="pm-landing-hero">
        <div className="pm-landing-badge">
          🇬🇭 Ghana&apos;s Dedicated Fleet Operating System • v1.0
        </div>
        <h1>
          Replace paper records with
          <span style={{ color: 'var(--pm-blue-600)' }}> digital fleet control</span>
        </h1>
        <p>
          ProMove gives Ghana&apos;s vehicle owners a single unified platform to track commercial vehicles,
          daily revenue collections, maintenance intervals, documents, and incidents across all major transit corridors.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--pm-space-6)' }}>
          <Show when="signed-out">
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button type="button" className="pm-btn pm-btn-primary pm-btn-lg">
                Start managing your fleet
                <ArrowRight size={18} />
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="pm-btn pm-btn-primary pm-btn-lg">
              Go to dashboard
              <ArrowRight size={18} />
            </Link>
          </Show>
          <Link href="/dashboard?demo=true" className="pm-btn pm-btn-secondary pm-btn-lg">
            View demo dashboard
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        background: 'var(--pm-blue-600)',
        padding: 'var(--pm-space-8) var(--pm-space-6)',
      }}>
        <div className="pm-container" style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 'var(--pm-space-6)',
        }}>
          {[
            { val: 'GH₵', label: 'Money stored as pesewas, never floats' },
            { val: 'Offline', label: 'Log income and trips with no signal' },
            { val: 'Audited', label: 'Every change to money and roles tracked' },
            { val: 'Isolated', label: 'Your data is never visible to other owners' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', color: '#FFFFFF' }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: 4,
              }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="pm-landing-section" style={{ background: 'var(--pm-bg-subtle)' }}>
        <div className="pm-container">
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            marginBottom: 'var(--pm-space-3)',
          }}>
            Everything a fleet owner needs
          </h2>
          <p style={{
            textAlign: 'center',
            color: 'var(--pm-text-secondary)',
            maxWidth: 520,
            margin: '0 auto var(--pm-space-10)',
            fontSize: '0.9375rem',
          }}>
            No more exercise books and WhatsApp messages. One platform handles
            your vehicles, drivers, money, and paperwork.
          </p>

          <div className="pm-feature-grid">
            {features.map(f => (
              <div key={f.title} className="pm-feature-item">
                <div className="pm-feature-icon">
                  <f.icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="pm-landing-section">
        <div className="pm-container">
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            marginBottom: 'var(--pm-space-10)',
          }}>
            Built for enterprise transport operations
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--pm-space-6)',
            maxWidth: 960,
            margin: '0 auto',
          }}>
            {[
              {
                role: 'Fleet Owner',
                desc: 'Full sovereign ownership of your workspace. Monitor vehicles, track daily cashflow, and manage confidential documents.',
                color: 'var(--pm-blue-600)',
              },
              {
                role: 'Operations Manager',
                desc: 'Coordinate maintenance, track incidents, and monitor live road telematics without financial modification rights.',
                color: 'var(--pm-success)',
              },
              {
                role: 'Platform Administrator',
                desc: 'Dedicated enterprise portal (/admin) for telematics monitoring, multi-tenant audits, and regulatory compliance.',
                color: 'var(--pm-blue-700)',
              },
              {
                role: 'Auditor & Accountant',
                desc: 'Immutable append-only ledger exports, revenue reconciliations, and statutory Act 843 compliance verification.',
                color: 'var(--pm-gray-500)',
              },
            ].map(r => (
              <div key={r.role} className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: r.color, marginBottom: 'var(--pm-space-3)',
                }} />
                <h4 style={{ marginBottom: 'var(--pm-space-2)' }}>{r.role}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5 }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: 'var(--pm-space-16) var(--pm-space-6)',
        background: 'var(--pm-blue-600)',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
          marginBottom: 'var(--pm-space-4)',
        }}>
          Ready to take control of your fleet?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          maxWidth: 460,
          margin: '0 auto var(--pm-space-8)',
          fontSize: '1rem',
        }}>
          Stop losing money in exercise books. Start with ProMove today.
        </p>
        <Show when="signed-out">
          <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
            <button type="button" className="pm-btn pm-btn-lg" style={{
              background: '#FFFFFF',
              color: 'var(--pm-blue-700)',
              fontWeight: 600,
            }}>
              Create your account
              <ArrowRight size={18} />
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link href="/dashboard" className="pm-btn pm-btn-lg" style={{
            background: '#FFFFFF',
            color: 'var(--pm-blue-700)',
            fontWeight: 600,
          }}>
            Open your dashboard
            <ArrowRight size={18} />
          </Link>
        </Show>
      </section>

      {/* Footer */}
      <footer style={{
        padding: 'var(--pm-space-8) var(--pm-space-6)',
        borderTop: '1px solid var(--pm-border)',
        background: 'var(--pm-bg)',
      }}>
        <div className="pm-container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--pm-space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/promove-logo-lockup.png" alt="ProMove Fleet Control" className="pm-brand-lockup pm-brand-lockup-footer" />
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--pm-text-muted)',
            display: 'flex',
            gap: 'var(--pm-space-6)',
            flexWrap: 'wrap',
          }}>
            <span>Built by Lextech Solutions, Accra</span>
            <Link href="/privacy" style={{ color: 'var(--pm-text-secondary)' }}>Privacy Policy</Link>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
