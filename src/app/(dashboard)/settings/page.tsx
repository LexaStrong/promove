'use client';

import React, { useState } from 'react';
import {
  Building2, Users, Shield, History, Plus,
  Save, CheckCircle2, UserCheck, Lock, Smartphone,
  Info
} from 'lucide-react';
import { mockOrg, mockUsers, mockAuditLogs } from '@/lib/mock-data';
import { Role } from '@/lib/types';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'org' | 'team' | 'security' | 'audit'>('org');

  // Org form state
  const [orgForm, setOrgForm] = useState({
    name: mockOrg.name,
    phone: mockOrg.phone,
    region: mockOrg.region,
    currency: mockOrg.currency,
    timezone: mockOrg.timezone,
  });
  const [orgSaved, setOrgSaved] = useState(false);

  // Team invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState(mockUsers);
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    phone: '+233 ',
    email: '',
    role: 'manager' as Role,
  });

  // Security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [autoSessionTimeout, setAutoSessionTimeout] = useState('30');

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 3000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.full_name || !inviteForm.phone) return;
    
    const newMember = {
      id: `user-${Date.now()}`,
      email: inviteForm.email || null,
      phone: inviteForm.phone,
      full_name: inviteForm.full_name,
      is_platform_admin: false,
      is_active: true,
      last_login_at: null,
    };
    setTeamMembers(prev => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteForm({ full_name: '', phone: '+233 ', email: '', role: 'manager' });
  };

  const getRoleBadge = (index: number) => {
    if (index === 0) return <span className="pm-badge pm-badge-info">Owner</span>;
    if (index === 1) return <span className="pm-badge pm-badge-success">Manager</span>;
    return <span className="pm-badge pm-badge-neutral">Driver</span>;
  };

  return (
    <div className="pm-container" style={{ paddingBottom: 'var(--pm-space-12)' }}>
      {/* Page Header */}
      <div className="pm-page-header">
        <div>
          <h1>Settings & Administration</h1>
          <p style={{ color: 'var(--pm-text-secondary)', marginTop: 4 }}>
            Manage organization profile, team members, security policies, and review audit records
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="pm-tabs" style={{ marginBottom: 'var(--pm-space-6)' }}>
        <button
          className={`pm-tab ${activeTab === 'org' ? 'active' : ''}`}
          onClick={() => setActiveTab('org')}
        >
          <Building2 size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
          Organization Profile
        </button>
        <button
          className={`pm-tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
          Team & Roles
        </button>
        <button
          className={`pm-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
          Security & Access
        </button>
        <button
          className={`pm-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <History size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: '-2px' }} />
          Audit Log
        </button>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === 'org' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--pm-space-6)' }}>
          <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
            <h3 style={{ marginBottom: 'var(--pm-space-4)' }}>Organization Details</h3>
            
            {orgSaved && (
              <div style={{
                background: 'var(--pm-success-light)',
                border: '1px solid var(--pm-success)',
                color: 'var(--pm-success)',
                borderRadius: 'var(--pm-radius-md)',
                padding: 'var(--pm-space-3) var(--pm-space-4)',
                marginBottom: 'var(--pm-space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.875rem'
              }}>
                <CheckCircle2 size={16} />
                Organization settings updated successfully.
              </div>
            )}

            <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
              <div>
                <label className="pm-form-label">Business / Fleet Name</label>
                <input
                  type="text"
                  className="pm-input"
                  value={orgForm.name}
                  onChange={e => setOrgForm({ ...orgForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="pm-form-label">Primary Contact Phone</label>
                <input
                  type="text"
                  className="pm-input"
                  value={orgForm.phone}
                  onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="pm-form-label">Region (Ghana)</label>
                <select
                  className="pm-select"
                  value={orgForm.region}
                  onChange={e => setOrgForm({ ...orgForm, region: e.target.value })}
                >
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Northern">Northern</option>
                  <option value="Volta">Volta</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Base Currency</label>
                  <input
                    type="text"
                    className="pm-input"
                    value={`${orgForm.currency} (Ghanaian Cedi)`}
                    disabled
                    style={{ background: 'var(--pm-bg-subtle)', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="pm-form-label">Timezone</label>
                  <input
                    type="text"
                    className="pm-input"
                    value={orgForm.timezone}
                    disabled
                    style={{ background: 'var(--pm-bg-subtle)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ paddingTop: 'var(--pm-space-2)' }}>
                <button type="submit" className="pm-btn pm-btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-6)' }}>
            <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
              <h3 style={{ marginBottom: 'var(--pm-space-3)' }}>Tenancy & Data Isolation</h3>
              <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--pm-space-4)' }}>
                Your account is isolated within an exclusive tenant workspace. Every transaction, driver, and vehicle entry is verified with strict tenancy constraints.
              </p>
              
              <div style={{ background: 'var(--pm-bg-subtle)', padding: 'var(--pm-space-4)', borderRadius: 'var(--pm-radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tenant ID
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9375rem', marginTop: 2 }}>
                  {mockOrg.id}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)', marginTop: 8 }}>
                  Registered on: {new Date(mockOrg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="pm-card" style={{ padding: 'var(--pm-space-6)', borderLeft: '4px solid var(--pm-blue-500)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Info size={20} style={{ color: 'var(--pm-blue-500)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: 4 }}>Accounting Precision</h4>
                  <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    ProMove stores all monetary figures in integer pesewas (GH₵ 1 = 100 pesewas). Floating-point rounding discrepancies are strictly prevented across all ledger calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Roles */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-6)' }}>
          <div className="pm-card">
            <div style={{
              padding: 'var(--pm-space-4) var(--pm-space-6)',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>Authorized Team Members</h3>
                <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                  Users authorized to access and operate {mockOrg.name}
                </p>
              </div>
              <button
                className="pm-btn pm-btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                <Plus size={16} />
                Invite Member
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Phone</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, idx) => (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 'var(--pm-radius-full)',
                            background: 'var(--pm-blue-100)', color: 'var(--pm-blue-700)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: '0.8125rem'
                          }}>
                            {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{member.full_name}</div>
                            {member.email && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{member.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{member.phone}</td>
                      <td>{getRoleBadge(idx)}</td>
                      <td>
                        <span className="pm-badge pm-badge-success">Active</span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)' }}>
                        {member.last_login_at
                          ? new Date(member.last_login_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : 'Pending invitation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permissions Reference */}
          <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
            <h3 style={{ marginBottom: 'var(--pm-space-4)' }}>Role Access Matrix</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--pm-space-4)' }}>
              <div style={{ padding: 'var(--pm-space-4)', background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <UserCheck size={18} style={{ color: 'var(--pm-blue-600)' }} />
                  <strong>Owner</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5 }}>
                  Vehicle owner / Fleet operator. Unrestricted full access to organisation, billing, role changes, and ledger overrides.
                </p>
              </div>

              <div style={{ padding: 'var(--pm-space-4)', background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <UserCheck size={18} style={{ color: 'var(--pm-success)' }} />
                  <strong>Manager</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5 }}>
                  Daily fleet manager. Operates vehicles, drivers, trips, maintenance, and records entries. No role changes, billing, or deletes.
                </p>
              </div>

              <div style={{ padding: 'var(--pm-space-4)', background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Smartphone size={18} style={{ color: 'var(--pm-warning)' }} />
                  <strong>Driver</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5 }}>
                  Assigned driver or conductor. Access limited to their assigned vehicle. Can log daily income, fuel, expenses, and report faults.
                </p>
              </div>

              <div style={{ padding: 'var(--pm-space-4)', background: 'var(--pm-bg-subtle)', borderRadius: 'var(--pm-radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Shield size={18} style={{ color: 'var(--pm-gray-600)' }} />
                  <strong>Viewer</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5 }}>
                  Accountant or silent co-investor. Read-only access to ledger records, vehicle stats, and financial reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Access */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-6)' }}>
          <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
            <h3 style={{ marginBottom: 'var(--pm-space-4)' }}>Authentication & Session Controls</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingBottom: 'var(--pm-space-4)', borderBottom: '1px solid var(--pm-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Two-Factor Authentication (TOTP)</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                    Require manager and owner roles to authenticate with an authenticator app (Google Authenticator / Authy)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`pm-btn ${twoFactorEnabled ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
                  style={{ minWidth: 100 }}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingBottom: 'var(--pm-space-4)', borderBottom: '1px solid var(--pm-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Automatic Session Timeout</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                    Automatically log out inactive dashboard sessions on shared or office computers
                  </div>
                </div>
                <select
                  className="pm-select"
                  value={autoSessionTimeout}
                  onChange={e => setAutoSessionTimeout(e.target.value)}
                  style={{ width: 140 }}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Data Encryption at Rest</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                    Driver licence numbers and sensitive identification records are stored using AES-256 Galois/Counter Mode
                  </div>
                </div>
                <span className="pm-badge pm-badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="pm-card" style={{ padding: 'var(--pm-space-6)' }}>
            <h3 style={{ marginBottom: 'var(--pm-space-3)' }}>Change Password</h3>
            <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.8125rem', marginBottom: 'var(--pm-space-4)' }}>
              Ensure your password is at least 8 characters with a mix of letters and numbers.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--pm-space-4)', maxWidth: 700 }}>
              <div>
                <label className="pm-form-label">Current Password</label>
                <input type="password" className="pm-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="pm-form-label">New Password</label>
                <input type="password" className="pm-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="pm-form-label">Confirm Password</label>
                <input type="password" className="pm-input" placeholder="••••••••" />
              </div>
            </div>
            <button className="pm-btn pm-btn-secondary" style={{ marginTop: 'var(--pm-space-4)' }}>
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Log */}
      {activeTab === 'audit' && (
        <div className="pm-card">
          <div style={{
            padding: 'var(--pm-space-4) var(--pm-space-6)',
            borderBottom: '1px solid var(--pm-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Immutable Audit Log</h3>
              <p style={{ color: 'var(--pm-text-secondary)', fontSize: '0.8125rem', marginTop: 2 }}>
                Every change to money, roles, assignments, and vehicles is permanently recorded
              </p>
            </div>
            <span className="pm-badge pm-badge-neutral">
              {mockAuditLogs.length} events logged
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className="pm-badge pm-badge-info" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {log.actor?.full_name || 'System / Platform Admin'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>
                      {log.entity_type} ({log.entity_id})
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      {log.ip_address}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.after ? JSON.stringify(log.after) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="pm-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="pm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="pm-modal-header">
              <h2>Invite Team Member</h2>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div className="pm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-4)' }}>
                <div>
                  <label className="pm-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="e.g. Samuel Osei"
                    value={inviteForm.full_name}
                    onChange={e => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="pm-form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="+233 24 123 4567"
                    value={inviteForm.phone}
                    onChange={e => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="pm-form-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="pm-input"
                    placeholder="samuel@example.com"
                    value={inviteForm.email}
                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="pm-form-label">Role Assignment *</label>
                  <select
                    className="pm-select"
                    value={inviteForm.role}
                    onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
                  >
                    <option value="manager">Manager (Daily Operations)</option>
                    <option value="driver">Driver (Assigned Vehicle Only)</option>
                    <option value="viewer">Viewer (Read-Only Financials)</option>
                  </select>
                </div>
              </div>

              <div className="pm-modal-footer">
                <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
