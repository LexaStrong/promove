'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Car, Users, BookOpen, Fuel,
  Wrench, FileText, AlertTriangle, Map, BarChart3,
  Settings, Bell, Menu, X, Search, LogOut, ChevronDown,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Fleet',
    items: [
      { href: '/vehicles', label: 'Vehicles', icon: Car },
      { href: '/drivers', label: 'Drivers', icon: Users },
      { href: '/trips', label: 'Trips', icon: Map },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/ledger', label: 'Daily Ledger', icon: BookOpen },
      { href: '/fuel', label: 'Fuel Log', icon: Fuel },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/maintenance', label: 'Maintenance', icon: Wrench },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, org, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PM';

  return (
    <div>
      {/* Sidebar */}
      <aside className={`pm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pm-sidebar-brand">
          <div className="pm-sidebar-brand-icon">
            <Truck size={20} />
          </div>
          <span className="pm-sidebar-brand-name">ProMove</span>
        </div>

        <nav className="pm-sidebar-nav">
          {navSections.map(section => (
            <div key={section.title} className="pm-sidebar-section">
              <div className="pm-sidebar-section-title">{section.title}</div>
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`pm-sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="pm-sidebar-footer">
          <Link
            href="/settings"
            className={`pm-sidebar-link ${pathname === '/settings' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 35, cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Topbar */}
      <header className="pm-topbar">
        <div className="pm-topbar-left">
          <button
            className="pm-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="pm-topbar-search"
              placeholder="Search vehicles, drivers..."
            />
          </div>
        </div>

        <div className="pm-topbar-right">
          <Link href="/notifications" style={{ position: 'relative', color: 'var(--pm-text-secondary)' }}>
            <Bell size={20} />
            <span className="pm-notif-dot" />
          </Link>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--pm-text)',
              }}
            >
              <div className="pm-topbar-avatar">{initials}</div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  {user?.full_name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>
                  {org?.name}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--pm-text-muted)' }} />
            </button>

            {profileOpen && (
              <div
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
                  borderRadius: 'var(--pm-radius-lg)', boxShadow: 'var(--pm-shadow-lg)',
                  minWidth: 200, zIndex: 50, overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pm-border)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{user?.phone}</div>
                </div>
                <Link
                  href="/settings"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', fontSize: '0.875rem', color: 'var(--pm-text)',
                  }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', fontSize: '0.875rem', color: 'var(--pm-error)',
                    background: 'none', border: 'none', width: '100%',
                    cursor: 'pointer', borderTop: '1px solid var(--pm-border)',
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pm-main">
        {children}
      </main>

      {/* Click outside to close profile */}
      {profileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
