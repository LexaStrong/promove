'use client';

import React from 'react';
import { Mail, Phone, Clock, MapPin, Headphones, Send, Sparkles, MessageSquare } from 'lucide-react';
import { siteConfig } from '@/lib/site';

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 2C6.495 2 2 6.48 2 12c0 1.954.563 3.774 1.536 5.319L2 22l4.814-1.508A9.946 9.946 0 0012.031 22C17.568 22 22 17.52 22 12s-4.432-10-9.969-10zm5.836 14.167c-.244.686-1.42 1.309-1.957 1.353-.51.042-1.168.06-3.791-.986-3.155-1.258-5.184-4.464-5.342-4.675-.154-.21-1.272-1.696-1.272-3.235 0-1.539.805-2.298 1.09-2.612.286-.314.625-.392.833-.392.208 0 .417.002.6.012.193.01.452-.073.707.54.263.633.897 2.19.976 2.35.078.16.13.348.024.564-.105.215-.157.348-.314.53-.157.183-.33.408-.471.548-.157.157-.32.327-.138.64.183.314.814 1.343 1.747 2.174 1.198 1.069 2.207 1.399 2.522 1.556.314.157.498.131.682-.079.183-.21.786-.916.996-1.23.21-.314.42-.262.708-.157.288.105 1.833.864 2.148 1.021.314.157.524.236.602.367.079.131.079.76-.165 1.446z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="pm-landing-section" style={{ background: 'var(--pm-bg)' }}>
      <div className="pm-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto var(--pm-space-10)' }}>
          <div className="pm-landing-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Headphones size={15} />
            Dedicated Ghana Fleet Support Desk
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            marginBottom: 'var(--pm-space-3)',
            color: 'var(--pm-text)',
            letterSpacing: '-0.02em',
          }}>
            Reach Out to <span style={{ color: 'var(--pm-blue-600)' }}>ProMove Ghana</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--pm-text-secondary)',
            lineHeight: 1.6,
          }}>
            Have questions about tracking your vehicles, configuring driver accounts, or enterprise fleet pricing?
            Our Accra-based team is on standby to assist you.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--pm-space-6)',
          marginBottom: 'var(--pm-space-8)',
        }}>
          {/* Card 1: Support Email */}
          <div className="pm-card" style={{
            padding: 'var(--pm-space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid var(--pm-blue-600)',
            transition: 'transform var(--pm-transition), box-shadow var(--pm-transition)',
          }}>
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pm-radius-md)',
                background: 'var(--pm-blue-50)',
                color: 'var(--pm-blue-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--pm-space-4)',
              }}>
                <Headphones size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 6 }}>
                Technical & Fleet Support
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)', lineHeight: 1.5 }}>
                For account assistance, GPS device setup, ledger reconciliation, or mobile sync issues.
              </p>
              <div style={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--pm-blue-600)',
                wordBreak: 'break-all',
                marginBottom: 'var(--pm-space-4)',
              }}>
                {siteConfig.supportEmail}
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.supportEmail}?subject=Support%20Request%20-%20ProMove%20Fleet`}
              className="pm-btn pm-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            >
              <Mail size={16} />
              Email Support
            </a>
          </div>

          {/* Card 2: General Inquiries */}
          <div className="pm-card" style={{
            padding: 'var(--pm-space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #1B7A9E',
            transition: 'transform var(--pm-transition), box-shadow var(--pm-transition)',
          }}>
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pm-radius-md)',
                background: '#EDF5F8',
                color: '#1B7A9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--pm-space-4)',
              }}>
                <Mail size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 6 }}>
                General & Sales Inquiries
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)', lineHeight: 1.5 }}>
                For enterprise subscriptions, partnership opportunities, bulk fleet pricing, and tenders.
              </p>
              <div style={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#1B7A9E',
                wordBreak: 'break-all',
                marginBottom: 'var(--pm-space-4)',
              }}>
                {siteConfig.infoEmail}
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.infoEmail}?subject=General%20Inquiry%20-%20ProMove%20Ghana`}
              className="pm-btn pm-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
            >
              <Send size={16} />
              Email Inquiries
            </a>
          </div>

          {/* Card 3: WhatsApp & Phone */}
          <div className="pm-card" style={{
            padding: 'var(--pm-space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #25D366',
            background: 'var(--pm-surface)',
            transition: 'transform var(--pm-transition), box-shadow var(--pm-transition)',
          }}>
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pm-radius-md)',
                background: 'rgba(37, 211, 102, 0.12)',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--pm-space-4)',
              }}>
                <WhatsAppIcon size={26} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 6 }}>
                Direct Call & WhatsApp
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)', lineHeight: 1.5 }}>
                Fast communication via WhatsApp or voice for fleet owners, drivers, and fleet managers.
              </p>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.0625rem',
                color: 'var(--pm-text)',
                marginBottom: 'var(--pm-space-4)',
              }}>
                {siteConfig.phoneDisplay}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pm-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                <WhatsAppIcon size={18} />
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.phone}`}
                className="pm-btn pm-btn-ghost pm-btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: 6 }}
              >
                <Phone size={14} />
                Call +233 59 522 7273
              </a>
            </div>
          </div>

          {/* Card 4: Official Socials */}
          <div className="pm-card" style={{
            padding: 'var(--pm-space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #E1306C',
            transition: 'transform var(--pm-transition), box-shadow var(--pm-transition)',
          }}>
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pm-radius-md)',
                background: 'rgba(225, 48, 108, 0.1)',
                color: '#E1306C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--pm-space-4)',
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 6 }}>
                Follow {siteConfig.socials.handle}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--pm-text-secondary)', marginBottom: 'var(--pm-space-4)', lineHeight: 1.5 }}>
                Connect with our community across Instagram, Facebook, and X for industry updates and news.
              </p>
              <div style={{
                display: 'inline-block',
                background: 'var(--pm-bg-subtle)',
                padding: '4px 10px',
                borderRadius: 'var(--pm-radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--pm-text)',
                marginBottom: 'var(--pm-space-4)',
              }}>
                Official Tag: {siteConfig.socials.handle}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="ProMove on Instagram"
                className="pm-btn pm-btn-secondary pm-btn-sm"
                style={{
                  padding: '8px 0',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="ProMove on Facebook"
                className="pm-btn pm-btn-secondary pm-btn-sm"
                style={{
                  padding: '8px 0',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={siteConfig.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                title="ProMove on X"
                className="pm-btn pm-btn-secondary pm-btn-sm"
                style={{
                  padding: '8px 0',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <XIcon size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Operating Hours & Location Banner */}
        <div style={{
          background: 'var(--pm-bg-subtle)',
          borderRadius: 'var(--pm-radius-lg)',
          border: '1px solid var(--pm-border)',
          padding: 'var(--pm-space-5) var(--pm-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--pm-space-4)',
          fontSize: '0.875rem',
          color: 'var(--pm-text-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={18} style={{ color: 'var(--pm-blue-600)', flexShrink: 0 }} />
            <span>
              <strong>Operations Hub:</strong> {siteConfig.address.streetAddress}, {siteConfig.address.addressLocality}, Ghana
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} style={{ color: 'var(--pm-success)', flexShrink: 0 }} />
            <span>
              <strong>Support Hours:</strong> Mon – Sat 7:00 AM – 8:00 PM GMT • Roadside urgent support 24/7
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
