'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, ArrowRight, ArrowLeft, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthBrandPanel from '@/components/auth-brand-panel';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState('+233244123456');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
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
        router.push('/dashboard');
      } else {
        setError('Invalid phone number, password, or 2FA code.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword('password123');
    login(demoPhone, 'password123').then(() => {
      router.push('/dashboard');
    });
  };

  return (
    <div className="pm-auth-page-wrapper">
      <main className="pm-login-layout">
        <AuthBrandPanel mode="login" />

        <section className="pm-login-form-panel" aria-labelledby="pm-login-title">
          <div className="pm-login-form-inner">
            <div className="pm-login-top-bar">
              <Link href="/" className="pm-auth-back-link">
                <ArrowLeft size={15} />
                <span>Back to ProMove</span>
              </Link>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pm-text-muted)' }}>
                🇬🇭 Ghana
              </span>
            </div>

            <header className="pm-login-heading">
              <span>SECURE SIGN-IN</span>
              <h2 id="pm-login-title">Welcome back</h2>
              <p>Sign in to access your fleet operations and daily financial ledger.</p>
            </header>

            <div className="pm-card pm-login-card">
              {error && (
                <div style={{
                  background: 'var(--pm-error-light)',
                  color: 'var(--pm-error)',
                  border: '1px solid var(--pm-error)',
                  padding: 'var(--pm-space-3) var(--pm-space-4)',
                  borderRadius: 'var(--pm-radius-md)',
                  fontSize: '0.875rem',
                  marginBottom: 'var(--pm-space-4)',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Ghana Mobile Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
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
                    Enter registered Ghana phone with country code (+233)
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="pm-form-label" style={{ marginBottom: 0 }}>Password</label>
                    <a href="#" style={{ fontSize: '0.75rem', color: 'var(--pm-text-link)', textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div className="pm-password-wrapper">
                    <Lock size={16} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="pm-input"
                      style={{ paddingLeft: 38, paddingRight: 40 }}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pm-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* TOTP 2FA Option */}
                <div style={{ background: 'var(--pm-bg-subtle)', padding: '10px 12px', borderRadius: 'var(--pm-radius-md)', border: '1px solid var(--pm-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--pm-text)' }}>
                      Two-Factor Auth (TOTP)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTotpInput(!showTotpInput)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--pm-text-link)',
                        fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600,
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
                        style={{ textAlign: 'center', letterSpacing: '0.25em', fontWeight: 700, fontSize: '1.125rem' }}
                      />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', display: 'block', marginTop: 4 }}>
                        Authenticator app code (TOTP RFC 6238, no SMS delay)
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
                  style={{ width: '100%', padding: '12px', marginTop: 'var(--pm-space-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Demo Fast Login for Fleet Owner (Admin button restricted to /admin) */}
              <div style={{ marginTop: 'var(--pm-space-5)', borderTop: '1px solid var(--pm-border)', paddingTop: 'var(--pm-space-3)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
                  Quick Demo Access
                </div>
                <button
                  type="button"
                  className="pm-btn pm-btn-secondary pm-btn-sm"
                  style={{ fontSize: '0.8125rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px' }}
                  onClick={() => handleQuickLogin('+233244123456')}
                >
                  <UserCheck size={15} style={{ color: 'var(--pm-blue-600)' }} /> Quick Demo: Sign in as Fleet Owner
                </button>
              </div>

              {/* Driver App Link - Commented out for now per user instruction */}
              {/*
              <div style={{
                marginTop: 'var(--pm-space-4)',
                background: 'var(--pm-bg-subtle)',
                padding: 'var(--pm-space-3) var(--pm-space-4)',
                borderRadius: 'var(--pm-radius-md)',
                textAlign: 'center',
                fontSize: '0.8125rem',
                border: '1px solid var(--pm-border-subtle)',
              }}>
                Driver on the road?{' '}
                <Link href="/driver-app" style={{ fontWeight: 600, color: 'var(--pm-blue-600)' }}>
                  Launch Driver PWA
                </Link>
              </div>
              */}
            </div>

            <div className="pm-login-footer">
              Don&apos;t have an account?{' '}
              <Link href="/register">Register your fleet</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
