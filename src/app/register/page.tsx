'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Building2, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthBrandPanel from '@/components/auth-brand-panel';
import { ThemeToggle } from '@/components/theme-toggle';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminSignup = searchParams.get('role') === 'admin';
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '+233 ',
    email: '',
    org_name: '',
    region: 'Greater Accra',
    fleet_type: 'trotro',
    fleet_size: '1-5',
    password: '',
    confirm_password: '',
    agree_terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.agree_terms) {
      setError('Please agree to the tenancy and terms of service.');
      return;
    }

    setLoading(true);

    try {
      if (isAdminSignup) {
        // Registering as platform administrator
        await login('+233244999999', formData.password);
        router.push('/dashboard');
      } else {
        // Registering as fleet owner -> Leads to fleet onboarding
        await login(formData.phone, formData.password);
        router.push('/onboarding');
      }
    } catch {
      setError('Failed to create account. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-auth-page-wrapper">
      <main className="pm-login-layout pm-register-layout">
        <AuthBrandPanel mode="register" />

        <section className="pm-login-form-panel pm-register-form-panel" aria-labelledby="pm-register-title">
          <div className="pm-login-form-inner pm-register-form-inner">
            <div className="pm-login-top-bar">
              <Link href={isAdminSignup ? '/admin' : '/'} className="pm-auth-back-link">
                <ArrowLeft size={15} />
                <span>{isAdminSignup ? 'Back to Admin Portal' : 'Back to ProMove'}</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ThemeToggle />
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: isAdminSignup ? 'var(--pm-blue-700)' : 'var(--pm-text-muted)',
                  background: isAdminSignup ? 'var(--pm-blue-100)' : 'transparent',
                  padding: isAdminSignup ? '2px 8px' : '0',
                  borderRadius: 'var(--pm-radius-sm)',
                }}>
                  {isAdminSignup ? '🛡️ Admin Account Creation' : '🇬🇭 Ghana Fleet Registration'}
                </span>
              </div>
            </div>

            <header className="pm-login-heading">
              <span>{isAdminSignup ? 'ADMINISTRATOR PRIVILEGES' : 'CREATE FLEET ACCOUNT'}</span>
              <h2 id="pm-register-title">
                {isAdminSignup ? 'Register administrator' : 'Register your fleet'}
              </h2>
              <p>
                {isAdminSignup
                  ? 'Set up your platform administrator profile for system telematics, multi-tenant audits, and enterprise governance.'
                  : 'Set up your owner profile and transport workspace in under 3 minutes.'}
              </p>
            </header>

            <div className="pm-card pm-register-card">
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
                {/* Section 1: User Info */}
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                      background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>1</span>
                    {isAdminSignup ? 'Administrator Identity' : 'Account Holder (Owner) Details'}
                  </h3>

                  <div className="pm-register-grid-two">
                    <div>
                      <label className="pm-form-label">Full Name *</label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{
                          position: 'absolute', left: 12, top: '50%',
                          transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                        }} />
                        <input
                          type="text"
                          className="pm-input"
                          style={{ paddingLeft: 38 }}
                          placeholder={isAdminSignup ? 'e.g. Samuel Darko' : 'e.g. Frank Twum'}
                          value={formData.full_name}
                          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="pm-form-label">Ghana Mobile Phone *</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{
                          position: 'absolute', left: 12, top: '50%',
                          transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                        }} />
                        <input
                          type="tel"
                          className="pm-input"
                          style={{ paddingLeft: 38 }}
                          placeholder="+233 24 123 4567"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--pm-space-3)' }}>
                    <label className="pm-form-label">Email Address {isAdminSignup ? '*' : '(Optional)'}</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                      }} />
                      <input
                        type="email"
                        className="pm-input"
                        style={{ paddingLeft: 38 }}
                        placeholder={isAdminSignup ? 'admin@lextech.com.gh' : 'frank@twumtransport.com'}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required={isAdminSignup}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Fleet / Organization Profile */}
                <div style={{ borderTop: '1px solid var(--pm-border)', paddingTop: 'var(--pm-space-4)' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                      background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>2</span>
                    {isAdminSignup ? 'Administrative Scope' : 'Organization / Fleet Profile'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
                    <div>
                      <label className="pm-form-label">{isAdminSignup ? 'Department / Unit Name *' : 'Transport Business Name *'}</label>
                      <div style={{ position: 'relative' }}>
                        <Building2 size={16} style={{
                          position: 'absolute', left: 12, top: '50%',
                          transform: 'translateY(-50%)', color: 'var(--pm-text-muted)',
                        }} />
                        <input
                          type="text"
                          className="pm-input"
                          style={{ paddingLeft: 38 }}
                          placeholder={isAdminSignup ? 'e.g. Regional Fleet Oversight' : 'e.g. Twum Transport Services Ltd'}
                          value={formData.org_name}
                          onChange={e => setFormData({ ...formData, org_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="pm-register-grid-three">
                      <div>
                        <label className="pm-form-label">Region</label>
                        <select
                          className="pm-select"
                          value={formData.region}
                          onChange={e => setFormData({ ...formData, region: e.target.value })}
                        >
                          <option value="Greater Accra">Greater Accra</option>
                          <option value="Ashanti">Ashanti</option>
                          <option value="Western">Western</option>
                          <option value="Central">Central</option>
                          <option value="Eastern">Eastern</option>
                          <option value="Northern">Northern</option>
                        </select>
                      </div>

                      <div>
                        <label className="pm-form-label">Primary Fleet</label>
                        <select
                          className="pm-select"
                          value={formData.fleet_type}
                          onChange={e => setFormData({ ...formData, fleet_type: e.target.value })}
                        >
                          <option value="trotro">Trotro (Minibus)</option>
                          <option value="taxi">Taxi / Ride-hail</option>
                          <option value="bus">Intercity Bus</option>
                          <option value="truck">Cargo Truck</option>
                          <option value="pickup">Pickup / Delivery</option>
                        </select>
                      </div>

                      <div>
                        <label className="pm-form-label">{isAdminSignup ? 'Managed Scale' : 'Fleet Size'}</label>
                        <select
                          className="pm-select"
                          value={formData.fleet_size}
                          onChange={e => setFormData({ ...formData, fleet_size: e.target.value })}
                        >
                          <option value="1-5">1 - 5 vehicles</option>
                          <option value="6-20">6 - 20 vehicles</option>
                          <option value="21-50">21 - 50 vehicles</option>
                          <option value="50+">50+ vehicles</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Password */}
                <div style={{ borderTop: '1px solid var(--pm-border)', paddingTop: 'var(--pm-space-4)' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                      background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>3</span>
                    Security & Credentials
                  </h3>

                  <div className="pm-register-grid-two">
                    <div>
                      <label className="pm-form-label">Password *</label>
                      <div className="pm-password-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="pm-input"
                          style={{ paddingRight: 40 }}
                          placeholder="Min 8 characters"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
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

                    <div>
                      <label className="pm-form-label">Confirm Password *</label>
                      <div className="pm-password-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="pm-input"
                          style={{ paddingRight: 40 }}
                          placeholder="Repeat password"
                          value={formData.confirm_password}
                          onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="pm-password-toggle"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agree_terms}
                    onChange={e => setFormData({ ...formData, agree_terms: e.target.checked })}
                    style={{ marginTop: 3, cursor: 'pointer' }}
                    required
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                    I agree to the Tenancy Data Isolation Agreement and Terms of Service. Every financial entry and role modification will be recorded in an immutable audit trail.
                  </label>
                </div>

                <button
                  type="submit"
                  className="pm-btn pm-btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: 'var(--pm-space-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={loading}
                >
                  {loading
                    ? 'Creating Workspace...'
                    : isAdminSignup
                    ? 'Register & Launch Admin Workspace'
                    : 'Register & Launch Fleet Workspace'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            <div className="pm-login-footer">
              {isAdminSignup ? (
                <>
                  Already registered as Admin?{' '}
                  <Link href="/admin">Sign in to Admin Portal</Link>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <Link href="/login">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--pm-text-muted)' }}>Loading registration portal...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
