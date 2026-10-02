'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState('+233244123456');
  const [password, setPassword] = useState('password123');
  const [totpCode, setTotpCode] = useState('');
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const ok = await login(phone, password, totpCode);
      if (ok) {
        if (phone.includes('345678')) {
          router.push('/driver-app');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid phone number, password, or 2FA code.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoPhone: string, isDriver = false) => {
    setPhone(demoPhone);
    setPassword('password123');
    login(demoPhone, 'password123').then(() => {
      if (isDriver) {
        router.push('/driver-app');
      } else {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'var(--pm-space-6)',
      background: 'var(--pm-bg-subtle)',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--pm-space-6)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div className="pm-sidebar-brand-icon" style={{ width: 44, height: 44 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ProMove Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--pm-text)',
            letterSpacing: '-0.02em',
          }}>
            ProMove
          </span>
        </Link>
        <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.875rem', marginTop: 8 }}>
          Sign in to access your fleet operations and daily financial ledger
        </p>
      </div>

      {/* Main Login Card */}
      <div className="pm-card" style={{
        width: '100%',
        maxWidth: 440,
        padding: 'var(--pm-space-8)',
        boxShadow: 'var(--pm-shadow-md)',
      }}>
        {error && (
          <div style={{
            background: 'var(--pm-error-light)',
            color: 'var(--pm-error)',
            border: '1px solid var(--pm-error)',
            padding: 'var(--pm-space-3) var(--pm-space-4)',
            borderRadius: 'var(--pm-radius-md)',
            fontSize: '0.875rem',
            marginBottom: 'var(--pm-space-5)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
          <div>
            <label className="pm-form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
              }} />
              <input
                type="tel"
                className="pm-input"
                style={{ paddingLeft: 38 }}
                placeholder="+233 24 412 3456"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4, display: 'block' }}>
              Enter Ghana mobile number with country code
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="pm-form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--pm-text-link)' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
              }} />
              <input
                type="password"
                className="pm-input"
                style={{ paddingLeft: 38 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* TOTP 2FA Option */}
          <div style={{ background: 'var(--pm-bg-subtle)', padding: '10px 12px', borderRadius: 'var(--pm-radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--pm-text)' }}>
                Two-Factor Auth (TOTP)
              </span>
              <button
                type="button"
                onClick={() => setShowTotpInput(!showTotpInput)}
                style={{
                  background: 'none', border: 'none', color: 'var(--pm-text-link)',
                  fontSize: '0.75rem', cursor: 'pointer', padding: 0,
                }}
              >
                {showTotpInput ? 'Hide 2FA' : '+ Enter 6-digit code'}
              </button>
            </div>
            {showTotpInput && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="text"
                  className="pm-input"
                  placeholder="e.g. 849201"
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  style={{ textAlign: 'center', letterSpacing: '0.25em', fontWeight: 700, fontSize: '1rem' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', display: 'block', marginTop: 4 }}>
                  Authenticator app code (TOTP RFC 6238, no SMS 2FA)
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="remember" defaultChecked style={{ cursor: 'pointer' }} />
            <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', cursor: 'pointer' }}>
              Keep me signed in on this device
            </label>
          </div>

          <button
            type="submit"
            className="pm-btn pm-btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 'var(--pm-space-2)' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login with all 5 roles */}
        <div style={{ marginTop: 'var(--pm-space-6)', borderTop: '1px solid var(--pm-border)', paddingTop: 'var(--pm-space-4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, textAlign: 'center' }}>
            Quick Demo Login (5 Roles)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            <button
              type="button"
              className="pm-btn pm-btn-secondary pm-btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => handleQuickLogin('+233244123456')}
            >
              <UserCheck size={13} /> Owner
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-secondary pm-btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => handleQuickLogin('+233244234567')}
            >
              <ShieldCheck size={13} /> Manager
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-secondary pm-btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => handleQuickLogin('+233244345678', true)}
            >
              <Phone size={13} /> Driver PWA
            </button>
            <button
              type="button"
              className="pm-btn pm-btn-secondary pm-btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onClick={() => handleQuickLogin('+233244456789')}
            >
              <Lock size={13} /> Viewer
            </button>
          </div>
          <button
            type="button"
            className="pm-btn pm-btn-secondary pm-btn-sm"
            style={{ fontSize: '0.75rem', width: '100%', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onClick={() => handleQuickLogin('+233244999999')}
          >
            <ShieldCheck size={13} /> Platform Admin (Lextech Support)
          </button>
        </div>

        {/* Driver App Link */}
        <div style={{
          marginTop: 'var(--pm-space-4)',
          background: 'var(--pm-bg-subtle)',
          padding: 'var(--pm-space-3) var(--pm-space-4)',
          borderRadius: 'var(--pm-radius-md)',
          textAlign: 'center',
          fontSize: '0.8125rem',
        }}>
          Driver on the road?{' '}
          <Link href="/driver-app" style={{ fontWeight: 600, color: 'var(--pm-blue-600)' }}>
            Launch Driver PWA
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 'var(--pm-space-6)', fontSize: '0.875rem', color: 'var(--pm-text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ fontWeight: 600, color: 'var(--pm-blue-600)' }}>
          Register your fleet
        </Link>
      </div>
    </div>
  );
}
