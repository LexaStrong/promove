import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Car, BookOpen, Wrench, FileText,
  BarChart3, Shield, Wifi, ArrowRight,
} from 'lucide-react';
import { Show, UserButton } from '@clerk/nextjs';
import { siteUrl, siteConfig, getLandingPageFaqSchema } from '@/lib/site';
import MobileSplashScreen from '@/components/mobile-splash-screen';
import { ThemeToggle } from '@/components/theme-toggle';
import ContactSection from '@/components/contact-section';
import LandingFaq from '@/components/landing-faq';
import FloatingWhatsApp from '@/components/floating-whatsapp';

const features = [
  {
    icon: Car,
    title: 'Vehicle Registry & Fleet Assets',
    desc: 'Add vehicles one at a time or bulk-import an entire fleet from a spreadsheet. Track make, model, registration plate, chassis, and odometer in one place.',
  },
  {
    icon: BookOpen,
    title: 'Exact-Pesewa Daily Ledger',
    desc: 'Record driver sales, fuel expenses, maintenance, and owner remittances in exact Ghanaian pesewas. Void entries with a reason instead of deleting them.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking & History',
    desc: 'Set service intervals by distance or calendar. Log maintenance work with costs linked directly to the ledger. Never miss oil or brake inspections.',
  },
  {
    icon: FileText,
    title: 'DVLA & Document Expiry Alerts',
    desc: 'Upload insurance, roadworthiness certificates, and DVLA permits. Receive in-app reminders at 30, 14, and 7 days before expiry to avoid impoundments.',
  },
  {
    icon: BarChart3,
    title: 'Audited Financial Reports',
    desc: 'Per-vehicle and per-owner summaries, weekly and monthly, with PDF export. Balance sheets that match the ledger to the exact pesewa.',
  },
  {
    icon: Wifi,
    title: 'Works Offline with Auto-Sync',
    desc: 'Record driver income, trips, and expenses even with no cell signal on highway corridors. Data syncs automatically when connectivity returns.',
  },
  {
    icon: Shield,
    title: 'Statutory Data Protection (Act 843)',
    desc: 'Strict multi-tenant isolation, two-factor authentication, encrypted licence data, and an immutable audit trail on all changes to money and fleet roles.',
  },
];

export const metadata: Metadata = {
  title: 'Fleet Management for Ghanaian Transport Operators | ProMove',
  description:
    'Manage vehicles, daily driver collections in pesewas, DVLA roadworthiness alerts, maintenance, and fleet visibility from one operations workspace built for Ghana.',
  alternates: {
    canonical: new URL('/', siteUrl).toString(),
  },
  openGraph: {
    title: 'Fleet Management for Ghanaian Transport Operators | ProMove',
    description:
      'Manage vehicles, daily driver collections in pesewas, DVLA roadworthiness alerts, maintenance, and fleet visibility from one operations workspace built for Ghana.',
    url: new URL('/', siteUrl).toString(),
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ProMove fleet vehicles on Ghanaian road corridor',
    }],
  },
};

export default function LandingPage() {
  const faqSchema = getLandingPageFaqSchema();

  return (
    <div className="pm-landing-root">
      {/* FAQ Schema for Answer Engine Optimization (AEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Mobile Splash Screen Section */}
      <div className="pm-mobile-splash-wrapper">
        <MobileSplashScreen />
      </div>

      <div className="pm-desktop-landing-content" id="pm-landing-details">
        {/* Nav */}
        <nav className="pm-landing-nav" aria-label="Main Navigation">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/promove-logo-lockup.png"
              alt="ProMove Fleet Control"
              className="pm-brand-lockup pm-brand-lockup-landing"
              style={{ width: 190, maxWidth: '40%', height: 'auto', flexShrink: 0 }}
            />
          </Link>

          {/* Quick Nav Anchor Links on Desktop */}
          <div className="pm-landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#features" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#faq" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>
              FAQ
            </a>
            <Link href="/contact" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>
              Contact & Support
            </Link>
          </div>

          <div className="pm-landing-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <Show when="signed-out">
              <Link href="/sign-in" className="pm-btn pm-btn-ghost">
                Sign in
              </Link>
              <Link href="/sign-up" className="pm-btn pm-btn-primary">
                Get started
              </Link>
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
            daily revenue collections in exact pesewas, maintenance intervals, DVLA roadworthy documents, and incidents across all major transit corridors.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--pm-space-6)' }}>
            <Show when="signed-out">
              <Link href="/sign-up" className="pm-btn pm-btn-primary pm-btn-lg">
                Start managing your fleet
                <ArrowRight size={18} />
              </Link>
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
            <a
              href="#contact"
              className="pm-btn pm-btn-ghost pm-btn-lg"
              style={{ border: '1px solid var(--pm-border)' }}
            >
              Contact Support
            </a>
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
              { val: 'GH₵', label: 'Money stored as pesewas, zero rounding errors' },
              { val: 'Offline', label: 'Log income, fuel & trips with no cellular signal' },
              { val: 'Audited', label: 'Every change to money, roles, and records tracked' },
              { val: 'Isolated', label: 'Strict multi-tenancy ensures data confidentiality' },
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
        <section id="features" className="pm-landing-section" style={{ background: 'var(--pm-bg-subtle)' }}>
          <div className="pm-container">
            <h2 style={{
              textAlign: 'center',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              marginBottom: 'var(--pm-space-3)',
            }}>
              Everything a Ghanaian fleet owner needs
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--pm-text-secondary)',
              maxWidth: 540,
              margin: '0 auto var(--pm-space-10)',
              fontSize: '0.9375rem',
            }}>
              No more lost exercise books and disputed WhatsApp messages. One intuitive platform handles
              your vehicles, money, documents, and compliance.
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
                  desc: 'Full sovereign ownership of your workspace. Monitor vehicles, track daily cashflow in pesewas, and manage confidential documents.',
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

        {/* AEO FAQ Section */}
        <LandingFaq />

        {/* Contact & Support Section */}
        <ContactSection />

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
            Stop losing money in exercise books. Get started with ProMove today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="pm-btn pm-btn-lg"
                style={{
                  background: '#FFFFFF',
                  color: 'var(--pm-blue-700)',
                  fontWeight: 600,
                }}
              >
                Create your account
                <ArrowRight size={18} />
              </Link>
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
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pm-btn pm-btn-lg"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: 600,
                border: 'none',
              }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

        {/* Rich Multi-Column Footer */}
        <footer style={{
          padding: 'var(--pm-space-12) var(--pm-space-6) var(--pm-space-8)',
          borderTop: '1px solid var(--pm-border)',
          background: 'var(--pm-bg)',
        }}>
          <div className="pm-container">
            {/* Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--pm-space-8)',
              marginBottom: 'var(--pm-space-10)',
            }}>
              {/* Col 1: Brand Info */}
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/promove-logo-lockup.png"
                  alt="ProMove Fleet Control"
                  className="pm-brand-lockup pm-brand-lockup-footer"
                  style={{ width: 170, height: 'auto', marginBottom: 12 }}
                />
                <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                  Ghana&apos;s dedicated digital fleet operating system. Real-time vehicle telematics, pesewa cashflow tracking, and DVLA compliance.
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 'var(--pm-radius-full)',
                  background: 'var(--pm-bg-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--pm-text)',
                }}>
                  🇬🇭 Built for Ghana
                </div>
              </div>

              {/* Col 2: Platform Links */}
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12, color: 'var(--pm-text)' }}>
                  Platform
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                  <li><a href="#features" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>Vehicle Registry</a></li>
                  <li><a href="#features" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>Daily Ledger (Pesewas)</a></li>
                  <li><a href="#features" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>Maintenance Scheduling</a></li>
                  <li><a href="#features" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>DVLA Document Reminders</a></li>
                  <li><Link href="/contact" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>Contact & Support Desk</Link></li>
                  <li><Link href="/privacy" style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none' }}>Data Protection (Act 843)</Link></li>
                </ul>
              </div>

              {/* Col 3: Contact Details */}
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12, color: 'var(--pm-text)' }}>
                  Contact & Support
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Support Email</div>
                    <a href={`mailto:${siteConfig.supportEmail}`} style={{ color: 'var(--pm-blue-600)', fontWeight: 600, textDecoration: 'none' }}>
                      {siteConfig.supportEmail}
                    </a>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>General Inquiries</div>
                    <a href={`mailto:${siteConfig.infoEmail}`} style={{ color: 'var(--pm-text)', textDecoration: 'none' }}>
                      {siteConfig.infoEmail}
                    </a>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Phone & WhatsApp</div>
                    <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>
                      {siteConfig.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>

              {/* Col 4: Social Channels */}
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 12, color: 'var(--pm-text)' }}>
                  Connect With Us
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginBottom: 12 }}>
                  Official social handles: <strong>{siteConfig.socials.handle}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                  <a
                    href={siteConfig.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>Instagram:</span>
                    <strong style={{ color: 'var(--pm-text)' }}>@promovegh</strong>
                  </a>
                  <a
                    href={siteConfig.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>Facebook:</span>
                    <strong style={{ color: 'var(--pm-text)' }}>@promovegh</strong>
                  </a>
                  <a
                    href={siteConfig.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--pm-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>X (Twitter):</span>
                    <strong style={{ color: 'var(--pm-text)' }}>@promovegh</strong>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: '1px solid var(--pm-border)',
              paddingTop: 'var(--pm-space-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--pm-space-4)',
              fontSize: '0.8125rem',
              color: 'var(--pm-text-muted)',
            }}>
              <div>
                &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
              </div>
              <div style={{ display: 'flex', gap: 'var(--pm-space-6)', flexWrap: 'wrap' }}>
                <span>Built by Lextech Solutions, Accra, Ghana</span>
                <Link href="/privacy" style={{ color: 'var(--pm-text-secondary)' }}>
                  Privacy Policy (Act 843)
                </Link>
                <a href="/llms.txt" style={{ color: 'var(--pm-text-secondary)' }}>
                  LLMs / GEO Index
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Quick Action Button */}
        <FloatingWhatsApp />
      </div>
    </div>
  );
}
