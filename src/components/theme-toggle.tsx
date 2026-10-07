'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '@/lib/theme-context';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'inline';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'compact',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Segmented Variant (Settings & Configuration surfaces)
  if (variant === 'segmented') {
    const options: { value: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
      {
        value: 'light',
        label: 'Light',
        icon: <Sun size={16} />,
        desc: 'Clean daylight surfaces with Sea Navy brand accents',
      },
      {
        value: 'dark',
        label: 'Dark',
        icon: <Moon size={16} />,
        desc: 'Deep Sea Navy & Slate surfaces with high contrast',
      },
      {
        value: 'system',
        label: 'System',
        icon: <Laptop size={16} />,
        desc: 'Automatically matches your device OS preference',
      },
    ];

    return (
      <div className={`pm-theme-segmented-container ${className}`} style={{ width: '100%' }}>
        <div
          role="radiogroup"
          aria-label="Theme preference"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 8,
            padding: 4,
            background: 'var(--pm-bg-subtle)',
            borderRadius: 'var(--pm-radius-lg)',
            border: '1px solid var(--pm-border)',
          }}
        >
          {options.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTheme(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 'var(--pm-radius-md)',
                  border: isSelected ? '1px solid var(--pm-border)' : '1px solid transparent',
                  background: isSelected ? 'var(--pm-surface)' : 'transparent',
                  color: isSelected ? 'var(--pm-text)' : 'var(--pm-text-secondary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all var(--pm-transition)',
                  boxShadow: isSelected ? 'var(--pm-shadow-sm)' : 'none',
                }}
              >
                <span
                  style={{
                    color: isSelected ? 'var(--pm-text-link)' : 'var(--pm-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
                {isSelected && (
                  <Check
                    size={14}
                    style={{ marginLeft: 'auto', color: 'var(--pm-text-link)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--pm-text-muted)',
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          {options.find((o) => o.value === theme)?.desc}
        </p>
      </div>
    );
  }

  // Inline Variant (for sidebars and footer drawers)
  if (variant === 'inline') {
    return (
      <div
        className={`pm-theme-inline ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 'var(--pm-radius-md)',
          background: 'var(--pm-bg-subtle)',
          border: '1px solid var(--pm-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--pm-text-muted)' }}>
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text)', fontWeight: 500 }}>
            Dark Mode
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-label="Light mode"
            title="Light mode"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--pm-radius-sm)',
              border: theme === 'light' ? '1px solid var(--pm-border)' : 'none',
              background: theme === 'light' ? 'var(--pm-surface)' : 'transparent',
              color: theme === 'light' ? 'var(--pm-text)' : 'var(--pm-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Sun size={14} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
            title="Dark mode"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--pm-radius-sm)',
              border: theme === 'dark' ? '1px solid var(--pm-border)' : 'none',
              background: theme === 'dark' ? 'var(--pm-surface)' : 'transparent',
              color: theme === 'dark' ? 'var(--pm-text)' : 'var(--pm-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Moon size={14} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            aria-label="System theme"
            title="System theme"
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--pm-radius-sm)',
              border: theme === 'system' ? '1px solid var(--pm-border)' : 'none',
              background: theme === 'system' ? 'var(--pm-surface)' : 'transparent',
              color: theme === 'system' ? 'var(--pm-text)' : 'var(--pm-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Laptop size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Compact Variant (Topbars, Admin header, Auth headers)
  const currentIcon =
    theme === 'system' ? (
      <Laptop size={17} />
    ) : resolvedTheme === 'dark' ? (
      <Moon size={17} />
    ) : (
      <Sun size={17} />
    );

  const currentLabel =
    theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light';

  return (
    <div
      ref={containerRef}
      className={`pm-theme-toggle-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="pm-btn pm-btn-ghost pm-btn-sm"
        aria-label={`Current theme: ${currentLabel}. Click to change theme.`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title={`Theme: ${currentLabel}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: showLabel ? '6px 10px' : '6px 8px',
          borderRadius: 'var(--pm-radius-md)',
          color: 'var(--pm-text-secondary)',
          background: menuOpen ? 'var(--pm-bg-subtle)' : 'transparent',
          border: '1px solid var(--pm-border-subtle)',
          cursor: 'pointer',
          transition: 'all var(--pm-transition)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{currentIcon}</span>
        {showLabel && (
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--pm-text)' }}>
            {currentLabel}
          </span>
        )}
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Select theme"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: 156,
            background: 'var(--pm-surface)',
            border: '1px solid var(--pm-border)',
            borderRadius: 'var(--pm-radius-md)',
            boxShadow: 'var(--pm-shadow-md)',
            padding: 4,
            zIndex: 10010,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            animation: 'pm-slide-up 120ms ease',
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 'var(--pm-radius-sm)',
              border: 'none',
              background: theme === 'light' ? 'var(--pm-bg-subtle)' : 'transparent',
              color: 'var(--pm-text)',
              fontSize: '0.8125rem',
              fontWeight: theme === 'light' ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--pm-transition)',
            }}
          >
            <Sun size={15} style={{ color: 'var(--pm-text-muted)' }} />
            <span>Light</span>
            {theme === 'light' && (
              <Check size={14} style={{ marginLeft: 'auto', color: 'var(--pm-text-link)' }} />
            )}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 'var(--pm-radius-sm)',
              border: 'none',
              background: theme === 'dark' ? 'var(--pm-bg-subtle)' : 'transparent',
              color: 'var(--pm-text)',
              fontSize: '0.8125rem',
              fontWeight: theme === 'dark' ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--pm-transition)',
            }}
          >
            <Moon size={15} style={{ color: 'var(--pm-text-muted)' }} />
            <span>Dark</span>
            {theme === 'dark' && (
              <Check size={14} style={{ marginLeft: 'auto', color: 'var(--pm-text-link)' }} />
            )}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 'var(--pm-radius-sm)',
              border: 'none',
              background: theme === 'system' ? 'var(--pm-bg-subtle)' : 'transparent',
              color: 'var(--pm-text)',
              fontSize: '0.8125rem',
              fontWeight: theme === 'system' ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--pm-transition)',
            }}
          >
            <Laptop size={15} style={{ color: 'var(--pm-text-muted)' }} />
            <span>System</span>
            {theme === 'system' && (
              <Check size={14} style={{ marginLeft: 'auto', color: 'var(--pm-text-link)' }} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
export default ThemeToggle;
