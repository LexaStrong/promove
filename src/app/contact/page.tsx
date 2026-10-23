'use client';

import React from 'react';
import Link from 'next/link';
import { Headphones, ArrowLeft, ShieldCheck, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import ContactSection from '@/components/contact-section';
import FloatingWhatsApp from '@/components/floating-whatsapp';

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pm-bg)', color: 'var(--pm-text)' }}>
      {/* Top Banner Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #0B4F6C 0%, #083D54 100%)',
          color: '#FFFFFF',
          padding: 'var(--pm-space-6) var(--pm-space-4)',
          borderBottom: '3px solid #062b3b',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--pm-space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#EDF5F8',
                fontSize: '0.875rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Back to ProMove Home
            </Link>

            <Link
              href="/dashboard"
              className="pm-btn pm-btn-ghost"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', fontSize: '0.8125rem' }}
            >
              Go to Dashboard
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pm-space-4)', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--pm-radius-lg)',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Headphones size={28} color="#FFFFFF" />
            </div>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '2px 8px',
                  borderRadius: 'var(--pm-radius-full)',
                  background: 'rgba(255,255,255,0.12)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: 6,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Official Ghana Operations & Support Desk
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Contact & Technical Support
              </h1>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.9375rem', color: '#D0E8F0', maxWidth: 640 }}>
                Direct support for Ghanaian vehicle owners, fleet managers, and transit operators. Reach our Accra team for onboarding, hardware GPS setup, or billing inquiries.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area embedding the Contact Component */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--pm-space-6) var(--pm-space-4)' }}>
        {/* Quick Help Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--pm-space-4)',
            marginBottom: 'var(--pm-space-8)',
          }}
        >
          <div
            className="pm-card"
            style={{
              padding: 'var(--pm-space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--pm-space-3)',
              borderLeft: '4px solid #25D366',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#25D366',
                flexShrink: 0,
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Direct Phone / WhatsApp</div>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--pm-text)', textDecoration: 'none' }}
              >
                {siteConfig.phoneDisplay}
              </a>
            </div>
          </div>

          <div
            className="pm-card"
            style={{
              padding: 'var(--pm-space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--pm-space-3)',
              borderLeft: '4px solid var(--pm-blue-600)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(11, 79, 108, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pm-blue-600)',
                flexShrink: 0,
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Customer Support Desk</div>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--pm-blue-600)', textDecoration: 'none' }}
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          <div
            className="pm-card"
            style={{
              padding: 'var(--pm-space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--pm-space-3)',
              borderLeft: '4px solid var(--pm-primary)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(11, 79, 108, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pm-primary)',
                flexShrink: 0,
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>Operating Hours</div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--pm-text)' }}>
                Mon – Sat: 7:00 AM – 8:00 PM GMT
              </div>
            </div>
          </div>
        </div>

        {/* Embed Comprehensive Contact Section Component */}
        <ContactSection />
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />
    </div>
  );
}
