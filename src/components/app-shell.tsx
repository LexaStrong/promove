'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Car, Users, BookOpen, Fuel,
  Wrench, FileText, AlertTriangle, Map, BarChart3,
  Settings, Bell, Menu, X, Search, LogOut, ChevronDown,
  ShieldAlert, Smartphone, Navigation, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Role } from '@/lib/types';
import { UserButton } from '@clerk/nextjs';

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  ownerMobileAllowed: boolean;
  adminAllowed: boolean;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

const navSections: NavSectionConfig[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, ownerMobileAllowed: true, adminAllowed: true },
    ],
  },
  {
    title: 'Fleet',
    items: [
      { href: '/vehicles', label: 'Vehicles', icon: Car, ownerMobileAllowed: true, adminAllowed: true },
      /* 
       * DRIVER SECTION: Commented out for now per requirement: "the driver section must also be commented for now"
       * { href: '/drivers', label: 'Drivers', icon: Users, ownerMobileAllowed: false, adminAllowed: true },
       */
      { href: '/trips', label: 'Trips', icon: Map, ownerMobileAllowed: false, adminAllowed: true },
      { href: '/live-map', label: 'Live GPS Map', icon: Navigation, ownerMobileAllowed: true, adminAllowed: true },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/ledger', label: 'Daily Ledger', icon: BookOpen, ownerMobileAllowed: false, adminAllowed: true },
      { href: '/fuel', label: 'Fuel Log', icon: Fuel, ownerMobileAllowed: false, adminAllowed: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/maintenance', label: 'Maintenance', icon: Wrench, ownerMobileAllowed: true, adminAllowed: true },
      { href: '/documents', label: 'Documents', icon: FileText, ownerMobileAllowed: true, adminAllowed: false }, // Confidential to owners & drivers
      { href: '/incidents', label: 'Incidents', icon: AlertTriangle, ownerMobileAllowed: false, adminAllowed: true },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/reports', label: 'Reports', icon: BarChart3, ownerMobileAllowed: true, adminAllowed: true },
      { href: '/intelligence', label: 'Fleet Intelligence', icon: Sparkles, ownerMobileAllowed: false, adminAllowed: true },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, org, role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = mounted ? role === 'owner' : true;
  const isAdmin = mounted ? role === 'platform_admin' : false;

  const initials = mounted && user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PM';

  const activeNavItem = navSections
    .flatMap(section => section.items)
    .find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  const mobilePageTitle = activeNavItem?.label
    ?? pathname.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ')
    ?? 'Dashboard';

  return (
    <div>
      {/* Sidebar */}
      <aside id="primary-navigation" className={`pm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="pm-sidebar-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/promove-logo-lockup.png" alt="ProMove Fleet Control" className="pm-brand-lockup pm-brand-lockup-sidebar" />
        </div>

        <nav className="pm-sidebar-nav">
          {navSections.map(section => {
            // Filter items based on admin policy
            const visibleItems = section.items.filter(item => {
              if (isAdmin && !item.adminAllowed) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            // Check if section is completely exempt on mobile for owner
            const isAllExemptOnMobileForOwner = isOwner && visibleItems.every(i => !i.ownerMobileAllowed);

            return (
              <div
                key={section.title}
                className={`pm-sidebar-section ${isAllExemptOnMobileForOwner ? 'pm-owner-exempt-section' : ''}`}
              >
                <div className="pm-sidebar-section-title">{section.title}</div>
                {visibleItems.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const isExemptForOwnerOnMobile = isOwner && !item.ownerMobileAllowed;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`pm-sidebar-link ${isActive ? 'active' : ''} ${isExemptForOwnerOnMobile ? 'pm-owner-exempt-nav-item' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="pm-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link
            href="/privacy"
            className={`pm-sidebar-link ${pathname === '/privacy' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <ShieldAlert size={18} />
            Privacy (Act 843)
          </Link>
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
        <button
          type="button"
          className="pm-sidebar-overlay"
          aria-label="Close navigation menu"
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
            aria-controls="primary-navigation"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <span className="pm-mobile-page-title">{mobilePageTitle}</span>

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

          <UserButton />

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="pm-profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--pm-text)',
              }}
            >
              <div className="pm-topbar-avatar">{initials}</div>
              <div className="pm-profile-details" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {mounted ? user?.full_name || 'Fleet Owner' : ''}
                  </span>
                  <span className="pm-badge pm-badge-info" style={{ textTransform: 'capitalize', fontSize: '0.625rem', padding: '1px 6px' }}>
                    {mounted ? role.replace('_', ' ') : 'owner'}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>
                  {mounted ? org?.name || 'My Fleet' : ''}
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
                  minWidth: 220, zIndex: 50, overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--pm-border)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{user?.phone}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="pm-badge pm-badge-active" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                      Role: {role.replace('_', ' ')}
                    </span>
                  </div>
                </div>


                {/* Driver section commented out per user instruction */}
                {/*
                <Link
                  href="/driver-app"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', fontSize: '0.875rem', color: 'var(--pm-blue-600)',
                    fontWeight: 500,
                  }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Smartphone size={16} /> Driver PWA View
                </Link>
                */}

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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="pm-bottom-nav" aria-label="Mobile Bottom Navigation">
        <Link
          href="/dashboard"
          className={`pm-bottom-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/vehicles"
          className={`pm-bottom-nav-item ${pathname.startsWith('/vehicles') ? 'active' : ''}`}
        >
          <Car size={20} />
          <span>Vehicles</span>
        </Link>

        <Link
          href="/live-map"
          className={`pm-bottom-nav-item ${pathname === '/live-map' ? 'active' : ''}`}
        >
          <Navigation size={20} />
          <span>Live Map</span>
        </Link>

        <Link
          href="/maintenance"
          className={`pm-bottom-nav-item ${pathname.startsWith('/maintenance') ? 'active' : ''}`}
        >
          <Wrench size={20} />
          <span>Service</span>
        </Link>

        <button
          type="button"
          className={`pm-bottom-nav-item ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open full menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

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
