'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthBrandPanel from '@/components/auth-brand-panel';

export default function RegisterPage() {
  const router = useRouter();
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.agree_terms) {
      setError('Please agree to the terms of service.');
      return;
    }

    setLoading(true);

    try {
      // Simulate account and organization provisioning
      await login(formData.phone, formData.password);
      router.push('/dashboard');
    } catch {
      setError('Failed to create account. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pm-login-layout pm-register-layout">
      <AuthBrandPanel />

      <section className="pm-login-form-panel" aria-labelledby="pm-register-title">
        <div className="pm-login-form-inner pm-register-form-inner">
          <header className="pm-login-heading">
            <span>CREATE YOUR ACCOUNT</span>
            <h2 id="pm-register-title">Create your account</h2>
            <p>Set up your owner profile and fleet workspace.</p>
          </header>

          <div className="pm-card pm-login-card pm-register-card">
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-5)' }}>
          {/* Section 1: Fleet Owner Info */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700
              }}>1</span>
              Account Holder (Owner) Details
            </h3>

            <div className="pm-register-grid-two">
              <div>
                <label className="pm-form-label">Full Name *</label>
                <input
                  type="text"
                  className="pm-input"
                  placeholder="e.g. Frank Twum"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="pm-form-label">Ghana Mobile Phone *</label>
                <input
                  type="tel"
                  className="pm-input"
                  placeholder="+233 24 123 4567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--pm-space-3)' }}>
              <label className="pm-form-label">Email Address (Optional)</label>
              <input
                type="email"
                className="pm-input"
                placeholder="frank@twumtransport.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Fleet / Business Profile */}
          <div style={{ borderTop: '1px solid var(--pm-border)', paddingTop: 'var(--pm-space-4)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700
              }}>2</span>
              Organization / Fleet Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
              <div>
                <label className="pm-form-label">Transport Business Name *</label>
                <input
                  type="text"
                  className="pm-input"
                  placeholder="e.g. Twum Transport Services"
                  value={formData.org_name}
                  onChange={e => setFormData({ ...formData, org_name: e.target.value })}
                  required
                />
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
                  <label className="pm-form-label">Fleet Size</label>
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
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--pm-space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--pm-radius-full)',
                background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700
              }}>3</span>
              Security & Access
            </h3>

            <div className="pm-register-grid-two">
              <div>
                <label className="pm-form-label">Password *</label>
                <input
                  type="password"
                  className="pm-input"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="pm-form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="pm-input"
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                />
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
            <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', cursor: 'pointer' }}>
              I agree to the Tenancy Data Isolation Agreement and Terms of Service. Every financial entry and role modification will be recorded in an immutable audit trail.
            </label>
          </div>

          <button
            type="submit"
            className="pm-btn pm-btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Organization...' : 'Register & Launch Fleet Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>
          </div>

          <div className="pm-login-footer">
            Already registered?{' '}
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
