'use client';

import React, { useState } from 'react';
import { siteConfig } from '@/lib/site';

export default function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      aria-label="ProMove Fleet Support WhatsApp channel"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Tooltip badge on hover or focus */}
      <span
        style={{
          background: 'var(--pm-text)',
          color: 'var(--pm-text-inverse)',
          padding: '6px 12px',
          borderRadius: 'var(--pm-radius-full)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          boxShadow: 'var(--pm-shadow-lg)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Chat with Ghana Fleet Support
      </span>

      {/* Floating Button */}
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ProMove Ghana on WhatsApp (+233 59 522 7273)"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#25D366',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(37, 211, 102, 0.45)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          textDecoration: 'none',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.031 2C6.495 2 2 6.48 2 12c0 1.954.563 3.774 1.536 5.319L2 22l4.814-1.508A9.946 9.946 0 0012.031 22C17.568 22 22 17.52 22 12s-4.432-10-9.969-10zm5.836 14.167c-.244.686-1.42 1.309-1.957 1.353-.51.042-1.168.06-3.791-.986-3.155-1.258-5.184-4.464-5.342-4.675-.154-.21-1.272-1.696-1.272-3.235 0-1.539.805-2.298 1.09-2.612.286-.314.625-.392.833-.392.208 0 .417.002.6.012.193.01.452-.073.707.54.263.633.897 2.19.976 2.35.078.16.13.348.024.564-.105.215-.157.348-.314.53-.157.183-.33.408-.471.548-.157.157-.32.327-.138.64.183.314.814 1.343 1.747 2.174 1.198 1.069 2.207 1.399 2.522 1.556.314.157.498.131.682-.079.183-.21.786-.916.996-1.23.21-.314.42-.262.708-.157.288.105 1.833.864 2.148 1.021.314.157.524.236.602.367.079.131.079.76-.165 1.446z" />
        </svg>
      </a>
    </aside>
  );
}
