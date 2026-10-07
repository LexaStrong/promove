'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Search, X, LogOut, Check, Plus, Settings, Radio,
  MapPin, BatteryCharging, AlertTriangle, Eye
} from 'lucide-react';
import type { VehicleMarkerData } from '@/components/map/tracking-map';
import type { AdminUserData } from '@/app/api/admin/users/route';
import type { AdminVehicleItem } from '@/app/api/admin/vehicles/route';
import type { AdminIncidentItem } from '@/app/api/admin/incidents/route';
import './admin.css';

/**
 * Defensive JSON parser that guarantees no console SyntaxError on HTML/unexpected payloads
 */
async function safeJson<T = any>(res: Response): Promise<{ data: T | null; error?: string }> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return {
        data: null,
        error: res.ok ? 'Invalid response format' : `Server response (${res.status}): ${text.slice(0, 100)}`,
      };
    }
    const data = await res.json();
    return { data };
  } catch (err: any) {
    return { data: null, error: err?.message || 'JSON parsing error' };
  }
}

// Dynamically import Leaflet Map for SSR safety
const TrackingMap = dynamic(() => import('@/components/map/tracking-map'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '460px',
      backgroundColor: 'var(--admin-surface-subtle)',
      borderRadius: 'var(--admin-radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--admin-text-secondary)',
      fontSize: '0.875rem',
      fontWeight: 600,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 18,
          height: 18,
          border: '2px solid var(--admin-brand-accent)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        Loading Live Telematics Map...
      </div>
    </div>
  ),
});

type AdminTab = 'dashboard' | 'users' | 'vehicles' | 'incidents' | 'reports';

export default function AdminPage() {
  // Authentication State
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Platform Data
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicleItem[]>([]);
  const [incidents, setIncidents] = useState<AdminIncidentItem[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Modals / Detail Views
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleItem | null>(null);
  const [resolvingIncident, setResolvingIncident] = useState<AdminIncidentItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvingSubmitting, setResolvingSubmitting] = useState(false);

  // GPS Assignment State (for Managing User's Vehicles)
  const [assignGpsVehicleId, setAssignGpsVehicleId] = useState('');
  const [assignGpsPlate, setAssignGpsPlate] = useState('');
  const [assignGpsImei, setAssignGpsImei] = useState('');
  const [assignGpsProtocol, setAssignGpsProtocol] = useState('GT06');
  const [assignGpsInterval, setAssignGpsInterval] = useState('30');
  const [assignGpsSim, setAssignGpsSim] = useState('');
  const [assignGpsSubmitting, setAssignGpsSubmitting] = useState(false);
  const [assignGpsSuccessMsg, setAssignGpsSuccessMsg] = useState('');
  const [assignGpsErrorMsg, setAssignGpsErrorMsg] = useState('');

  // Add Vehicle for User State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehMake, setNewVehMake] = useState('Toyota');
  const [newVehModel, setNewVehModel] = useState('Hiace');
  const [newVehType, setNewVehType] = useState('trotro');
  const [newVehDriverName, setNewVehDriverName] = useState('');
  const [newVehDriverPhone, setNewVehDriverPhone] = useState('');
  const [newVehImei, setNewVehImei] = useState('');
  const [addingVehicleSubmitting, setAddingVehicleSubmitting] = useState(false);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilterStatus, setVehicleFilterStatus] = useState<string>('all');
  const [incidentFilterSeverity, setIncidentFilterSeverity] = useState<string>('all');
  const [incidentFilterStatus, setIncidentFilterStatus] = useState<string>('all');

  // Check admin session on initial load
  const verifySession = useCallback(async () => {
    try {
      setAuthChecking(true);
      const res = await fetch('/api/admin/auth/session');
      if (res.ok) {
        const { data } = await safeJson(res);
        if (data?.authenticated) {
          setIsAdminAuthenticated(true);
          setAdminEmail(data.email || 'admin@promovegh.com');
        } else {
          setIsAdminAuthenticated(false);
        }
      } else {
        setIsAdminAuthenticated(false);
      }
    } catch {
      setIsAdminAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Load platform data once authenticated
  const loadPlatformData = useCallback(async () => {
    if (!isAdminAuthenticated) return;
    setLoadingData(true);
    try {
      const [uRes, vRes, iRes, rRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/incidents'),
        fetch('/api/admin/reports'),
      ]);

      if (uRes.ok) {
        const { data: uData } = await safeJson(uRes);
        if (uData?.users) setUsers(uData.users);
      }
      if (vRes.ok) {
        const { data: vData } = await safeJson(vRes);
        if (vData?.vehicles) setVehicles(vData.vehicles);
      }
      if (iRes.ok) {
        const { data: iData } = await safeJson(iRes);
        if (iData?.incidents) setIncidents(iData.incidents);
      }
      if (rRes.ok) {
        const { data: rData } = await safeJson(rRes);
        if (rData?.data) setReportsData(rData.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadPlatformData();
    }
  }, [isAdminAuthenticated, loadPlatformData]);

  // Handle Admin Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const { data, error } = await safeJson(res);
      if (res.ok && data?.success) {
        setIsAdminAuthenticated(true);
        setAdminEmail(data.email);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data?.error || error || 'Invalid administrator credentials.');
      }
    } catch {
      setLoginError('A network error occurred. Please verify your connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
    setAdminEmail('');
    setSelectedUser(null);
    setSelectedVehicle(null);
  };

  // Handle GPS Device Assignment on User's Behalf
  const handleAssignGpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignGpsImei || (!assignGpsVehicleId && !assignGpsPlate)) {
      setAssignGpsErrorMsg('Please select a vehicle and enter a valid 15-digit GPS IMEI.');
      return;
    }

    setAssignGpsSubmitting(true);
    setAssignGpsSuccessMsg('');
    setAssignGpsErrorMsg('');

    try {
      const res = await fetch('/api/admin/assign-gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: assignGpsVehicleId,
          plate_number: assignGpsPlate,
          imei: assignGpsImei.trim(),
          protocol: assignGpsProtocol,
          reporting_interval_sec: parseInt(assignGpsInterval) || 30,
          sim_phone: assignGpsSim.trim(),
        }),
      });

      const { data, error } = await safeJson(res);
      if (res.ok && data?.success) {
        setAssignGpsSuccessMsg(`GPS Tracker IMEI ${assignGpsImei} assigned and linked successfully.`);
        await loadPlatformData();
        setAssignGpsImei('');
        setAssignGpsSim('');
      } else {
        setAssignGpsErrorMsg(data?.error || error || 'Failed to assign GPS device.');
      }
    } catch {
      setAssignGpsErrorMsg('Network error while assigning GPS device.');
    } finally {
      setAssignGpsSubmitting(false);
    }
  };

  // Handle Adding Vehicle for User
  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehPlate.trim()) return;

    setAddingVehicleSubmitting(true);
    try {
      const res = await fetch('/api/admin/create-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: selectedUser?.org_id,
          plate_number: newVehPlate.trim().toUpperCase(),
          make: newVehMake,
          model: newVehModel,
          vehicle_type: newVehType,
          driver_name: newVehDriverName.trim(),
          driver_phone: newVehDriverPhone.trim(),
          gps_tracker_imei: newVehImei.trim(),
        }),
      });

      if (res.ok) {
        setShowAddVehicleModal(false);
        setNewVehPlate('');
        setNewVehDriverName('');
        setNewVehDriverPhone('');
        setNewVehImei('');
        await loadPlatformData();
      } else {
        const { data, error } = await safeJson(res);
        alert(data?.error || error || 'Failed to create vehicle.');
      }
    } catch {
      alert('Network error while creating vehicle.');
    } finally {
      setAddingVehicleSubmitting(false);
    }
  };

  // Handle Resolving Incident
  const handleResolveIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncident) return;

    setResolvingSubmitting(true);
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvingIncident.id,
          status: 'resolved',
          resolution_notes: resolutionNotes.trim() || 'Resolved by Platform Administrator after telemetry verification.',
        }),
      });

      if (res.ok) {
        setResolvingIncident(null);
        setResolutionNotes('');
        await loadPlatformData();
      } else {
        const { data, error } = await safeJson(res);
        alert(data?.error || error || 'Failed to resolve incident.');
      }
    } catch {
      alert('Network error while resolving incident.');
    } finally {
      setResolvingSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // STATE 1: Checking Authentication
  // ─────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="admin-shell" data-theme="light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 20,
            height: 20,
            border: '2px solid var(--admin-brand-accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
            Verifying Platform Administrator Session...
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STATE 2: Unauthenticated - High-Contrast Restricted Console
  // ─────────────────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="admin-shell" data-theme="light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--admin-radius-lg)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '32px 28px 24px',
            backgroundColor: 'var(--admin-surface-subtle)',
            borderBottom: '1px solid var(--admin-border)',
            textAlign: 'center',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ProMove Logo" style={{ height: 38, width: 38, borderRadius: 8, margin: '0 auto 14px' }} />
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--admin-text-primary)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}>
              Platform Administration Console
            </h1>
            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--admin-text-secondary)',
              margin: 0,
            }}>
              Restricted portal. Authenticated via Clerk platform admin credentials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} style={{ padding: '28px' }}>
            {loginError && (
              <div style={{
                backgroundColor: 'var(--admin-danger-subtle)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                borderRadius: 'var(--admin-radius-sm)',
                padding: '10px 14px',
                color: 'var(--admin-danger-text)',
                fontSize: '0.8125rem',
                marginBottom: '20px',
              }}>
                {loginError}
              </div>
            )}

            <div className="admin-input-group">
              <label className="admin-label" htmlFor="admin-email">Administrator Email</label>
              <input
                id="admin-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@promovegh.com"
                required
                className="admin-input"
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label" htmlFor="admin-password">Clerk Account Password</label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="admin-input"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '8px' }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Platform Console'}
            </button>

            <div style={{
              marginTop: '20px',
              fontSize: '0.75rem',
              color: 'var(--admin-text-muted)',
              textAlign: 'center',
            }}>
              Protected by cryptographic HMAC session verification and Clerk RBAC.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Filtered Lists for Admin Tabs
  // ─────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.organization.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q)
    );
  });

  const filteredVehicles = vehicles.filter((v) => {
    if (vehicleFilterStatus !== 'all' && v.status !== vehicleFilterStatus) return false;
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.owner_name.toLowerCase().includes(q) ||
      v.driver_name.toLowerCase().includes(q) ||
      v.gps_tracker_imei.toLowerCase().includes(q)
    );
  });

  const filteredIncidents = incidents.filter((i) => {
    if (incidentFilterSeverity !== 'all' && i.severity !== incidentFilterSeverity) return false;
    if (incidentFilterStatus !== 'all' && i.status !== incidentFilterStatus) return false;
    return true;
  });

  // Map markers for vehicles with actual GPS locations
  const mapMarkers: VehicleMarkerData[] = vehicles
    .filter((v) => v.live_location !== null && v.live_location !== undefined)
    .map((v) => ({
      id: v.id,
      vehicleId: v.id,
      plateNumber: v.plate_number,
      label: v.plate_number,
      driverName: v.driver_name,
      status: v.status === 'moving' ? 'moving' : v.status === 'idle' ? 'idle' : 'parked',
      speedKmh: v.live_location?.speed_kmh || 0,
      courseHeading: v.live_location?.course_heading || 0,
      latitude: v.live_location?.latitude || 5.5600,
      longitude: v.live_location?.longitude || -0.2050,
      batteryPercentage: v.live_location?.battery_percentage || 95,
      ignition: v.live_location?.ignition || false,
      imei: v.gps_tracker_imei || 'UNASSIGNED',
      locationLabel: v.live_location?.location_label || 'Ghana Transit Route',
      condition: v.status === 'moving' ? ((v.live_location?.speed_kmh ?? 0) > 80 ? 'alert' : 'parked') : v.status === 'idle' ? 'idle' : 'parked',
    }));

  const selectedUserVehicles = selectedUser
    ? vehicles.filter(
        (v) =>
          (v.org_id && v.org_id === selectedUser.org_id) ||
          (v.owner_email && selectedUser.email && v.owner_email.toLowerCase() === selectedUser.email.toLowerCase()) ||
          (v.owner_name && selectedUser.organization && v.owner_name.toLowerCase() === selectedUser.organization.toLowerCase())
      )
    : [];

  // ─────────────────────────────────────────────
  // STATE 3: Authenticated Admin Operations Console
  // ─────────────────────────────────────────────
  return (
    <div className="admin-shell" data-theme="light">
      {/* Top Navigation */}
      <header className="admin-header">
        <div className="admin-brand-lockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ProMove Logo" style={{ height: 28, width: 28, borderRadius: 6 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="admin-brand-title">ProMove</span>
              <span className="admin-pill admin-pill-brand">Platform Admin</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>
              Ghana Multi-Tenant Transport Operations
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="admin-nav-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`admin-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            Unions & Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`admin-nav-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
          >
            Vehicles ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`admin-nav-tab ${activeTab === 'incidents' ? 'active' : ''}`}
          >
            Incidents ({incidents.filter(i => i.status === 'open').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`admin-nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
          >
            Reports
          </button>
        </nav>

        {/* Account Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
              {adminEmail}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--admin-success-text)' }}>
              Verified Platform Operator
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-btn admin-btn-ghost admin-btn-sm"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* ─────────────────────────────────────────────
            TAB 1: DASHBOARD OVERVIEW
        ───────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-heading-section">
              <h2 className="admin-heading-title">Platform Operations Overview</h2>
              <p className="admin-heading-description">
                Live statistics reflecting actual records in the Postgres database and connected telematics hardware.
              </p>
            </div>

            {/* Content-Driven KPI Strip */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Registered Fleet Unions</div>
                <div className="admin-kpi-value">{users.length}</div>
                <div className="admin-kpi-meta">Active tenant organisations</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Database Vehicles</div>
                <div className="admin-kpi-value">{vehicles.length}</div>
                <div className="admin-kpi-meta">Commercial trotro, taxi, and buses</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">GPS Trackers Linked</div>
                <div className="admin-kpi-value">
                  {vehicles.filter(v => v.gps_tracker_imei && v.gps_tracker_imei !== 'UNASSIGNED').length}
                </div>
                <div className="admin-kpi-meta">Hardware devices provisioned</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Open Incidents</div>
                <div className="admin-kpi-value" style={{ color: incidents.filter(i => i.status === 'open').length > 0 ? 'var(--admin-danger-text)' : 'var(--admin-success-text)' }}>
                  {incidents.filter(i => i.status === 'open').length}
                </div>
                <div className="admin-kpi-meta">
                  {incidents.length === 0 ? 'Zero safety alerts reported' : 'Requires review'}
                </div>
              </div>
            </div>

            {/* Split Content: Unions Directory & Recent Vehicles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
              {/* Organisations Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Registered Fleet Organisations</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                  >
                    View All Directory
                  </button>
                </div>
                {users.length === 0 ? (
                  <div className="admin-empty-state">
                    <div className="admin-empty-title">No Organisations Registered</div>
                    <div className="admin-empty-desc">New organisations will appear here upon onboarding.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {users.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setActiveTab('users'); }}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--admin-surface-subtle)',
                          borderRadius: 'var(--admin-radius-sm)',
                          border: '1px solid var(--admin-border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--admin-text-primary)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                            {u.organization} · {u.phone || u.email}
                          </div>
                        </div>
                        <span className="admin-pill admin-pill-neutral">
                          {u.vehicles_count} {u.vehicles_count === 1 ? 'vehicle' : 'vehicles'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Database Vehicles Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Database Fleet Vehicles</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vehicles')}
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                  >
                    View Roster
                  </button>
                </div>
                {vehicles.length === 0 ? (
                  <div className="admin-empty-state">
                    <div className="admin-empty-title">No Vehicles Registered</div>
                    <div className="admin-empty-desc">Registered fleet vehicles will be listed here.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {vehicles.slice(0, 5).map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--admin-surface-subtle)',
                          borderRadius: 'var(--admin-radius-sm)',
                          border: '1px solid var(--admin-border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="admin-mono" style={{ fontWeight: 700, color: 'var(--admin-brand-accent)' }}>
                              {v.plate_number}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                              {v.make} {v.model}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                            Operator: {v.owner_name}
                          </div>
                        </div>
                        <span className={`admin-pill ${v.gps_tracker_imei && v.gps_tracker_imei !== 'UNASSIGNED' ? 'admin-pill-success' : 'admin-pill-warning'}`}>
                          {v.gps_tracker_imei && v.gps_tracker_imei !== 'UNASSIGNED' ? 'GPS Linked' : 'No Tracker'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 2: USERS & UNIONS DIRECTORY
        ───────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 className="admin-heading-title">Platform Organisations and Users</h2>
                <p className="admin-heading-description">
                  Commercial transport operators and registered organisations in the database.
                </p>
              </div>

              <div style={{ position: 'relative', width: 280 }}>
                <Search size={14} color="#688292" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter users or organisations..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="admin-input"
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Organisation / Contact</th>
                    <th>Email Address</th>
                    <th>Contact Phone</th>
                    <th>Vehicles</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-title">No Matching Organisations</div>
                          <div className="admin-empty-desc">No records found matching your filter criteria.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>{u.organization}</div>
                        </td>
                        <td style={{ color: 'var(--admin-text-secondary)' }}>
                          {u.email || 'Not provided'}
                        </td>
                        <td className="admin-mono" style={{ color: 'var(--admin-text-secondary)' }}>
                          {u.phone || 'Not provided'}
                        </td>
                        <td>
                          <span className="admin-pill admin-pill-neutral">
                            {u.vehicles_count}
                          </span>
                        </td>
                        <td>
                          <span className="admin-pill admin-pill-success">
                            {u.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            <Settings size={12} /> Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 3: VEHICLES ROSTER & SUPERVISION
        ───────────────────────────────────────────── */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
              <div>
                <h2 className="admin-heading-title">Fleet Vehicles Roster</h2>
                <p className="admin-heading-description">
                  Real database vehicles and hardware telematics configurations.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select
                  value={vehicleFilterStatus}
                  onChange={(e) => setVehicleFilterStatus(e.target.value)}
                  className="admin-select"
                  style={{ width: 140 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="parked">Parked</option>
                  <option value="idle">Idle</option>
                  <option value="moving">Moving</option>
                </select>

                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} color="#688292" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search plate or model..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="admin-input"
                    style={{ paddingLeft: 34 }}
                  />
                </div>
              </div>
            </div>

            {/* Supervision Map (Displays vehicles with real telematics) */}
            <div style={{ marginBottom: 24, borderRadius: 'var(--admin-radius-lg)', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
              <TrackingMap
                vehicles={mapMarkers}
                selectedVehicleId={selectedVehicle?.id}
                onSelectVehicle={(vehMarker) => {
                  const found = vehicles.find((v) => v.plate_number === vehMarker.plateNumber || v.id === vehMarker.id);
                  if (found) setSelectedVehicle(found);
                }}
                onVehicleClick={(vehMarker) => {
                  const found = vehicles.find((v) => v.plate_number === vehMarker.plateNumber || v.id === vehMarker.id);
                  if (found) setSelectedVehicle(found);
                }}
                mapHeight="440px"
              />
            </div>

            {/* Roster Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Registration Plate</th>
                    <th>Specifications</th>
                    <th>Fleet Operator</th>
                    <th>Assigned Driver</th>
                    <th>GPS Device IMEI</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-title">No Vehicles Registered</div>
                          <div className="admin-empty-desc">No database vehicle records match this query.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((v) => (
                      <tr key={v.id} onClick={() => setSelectedVehicle(v)} style={{ cursor: 'pointer' }}>
                        <td className="admin-mono" style={{ fontWeight: 700, color: 'var(--admin-brand-accent)' }}>
                          {v.plate_number}
                        </td>
                        <td>
                          <div>{v.make} {v.model} ({v.year})</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', textTransform: 'capitalize' }}>
                            {v.vehicle_type} · {v.seats} seats
                          </div>
                        </td>
                        <td style={{ color: 'var(--admin-text-secondary)' }}>
                          {v.owner_name}
                        </td>
                        <td>
                          <div>{v.driver_name}</div>
                          {v.driver_phone && (
                            <div className="admin-mono" style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>
                              {v.driver_phone}
                            </div>
                          )}
                        </td>
                        <td className="admin-mono">
                          {v.gps_tracker_imei && v.gps_tracker_imei !== 'UNASSIGNED' ? (
                            <span style={{ color: 'var(--admin-success-text)' }}>{v.gps_tracker_imei}</span>
                          ) : (
                            <span style={{ color: 'var(--admin-text-muted)' }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span className={`admin-pill ${v.status === 'moving' ? 'admin-pill-success' : v.status === 'active' ? 'admin-pill-brand' : 'admin-pill-neutral'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVehicle(v);
                            }}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 4: INCIDENTS REGISTRY
        ───────────────────────────────────────────── */}
        {activeTab === 'incidents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 className="admin-heading-title">Platform Incident Registry</h2>
                <p className="admin-heading-description">
                  Recorded breakdowns, speed compliance alerts, and corridor safety events from database logs.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={incidentFilterSeverity}
                  onChange={(e) => setIncidentFilterSeverity(e.target.value)}
                  className="admin-select"
                  style={{ width: 140 }}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={incidentFilterStatus}
                  onChange={(e) => setIncidentFilterStatus(e.target.value)}
                  className="admin-select"
                  style={{ width: 140 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="admin-card">
                <div className="admin-empty-state">
                  <div className="admin-empty-title">Incident Registry Clear</div>
                  <div className="admin-empty-desc">
                    There are currently no active safety alerts or breakdown incidents recorded in the system.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                {filteredIncidents.map((inc) => (
                  <div key={inc.id} className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className="admin-mono" style={{ fontWeight: 700, color: 'var(--admin-brand-accent)' }}>
                        {inc.plate_number}
                      </span>
                      <span className={`admin-pill ${inc.severity === 'critical' ? 'admin-pill-danger' : inc.severity === 'high' ? 'admin-pill-warning' : 'admin-pill-neutral'}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, textTransform: 'capitalize' }}>
                      {inc.incident_type.replace('_', ' ')}
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {inc.description}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: 4 }}>
                      Location: {inc.location_text}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                      Driver: {inc.driver_name}
                    </div>

                    {inc.status !== 'resolved' && (
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--admin-border-subtle)', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingIncident(inc);
                            setResolutionNotes('');
                          }}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          Resolve Incident
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 5: PLATFORM REPORTS
        ───────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div>
            <div className="admin-heading-section">
              <h2 className="admin-heading-title">Platform Operations Telematics and Audits</h2>
              <p className="admin-heading-description">
                Aggregated metrics derived from current Neon Postgres database records.
              </p>
            </div>

            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Registered Organisations</div>
                <div className="admin-kpi-value">
                  {reportsData?.kpis?.total_registered_organisations ?? users.length}
                </div>
                <div className="admin-kpi-meta">Multi-tenant operators</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Supervised Vehicles</div>
                <div className="admin-kpi-value">
                  {reportsData?.kpis?.total_fleet_vehicles ?? vehicles.length}
                </div>
                <div className="admin-kpi-meta">Commercial vehicles in database</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Recorded Odometer</div>
                <div className="admin-kpi-value">
                  {Number(reportsData?.kpis?.total_fleet_odometer_km || 0).toLocaleString()} km
                </div>
                <div className="admin-kpi-meta">Cumulative fleet distance</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Safety Compliance</div>
                <div className="admin-kpi-value" style={{ color: 'var(--admin-success-text)' }}>
                  {reportsData?.safety_summary?.resolution_rate_percent ?? 100}%
                </div>
                <div className="admin-kpi-meta">Statutory resolution rate</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
              {/* Vehicle Composition */}
              <div className="admin-card">
                <h3 className="admin-card-title" style={{ marginBottom: 16 }}>
                  Fleet Vehicle Classification
                </h3>
                {(!reportsData?.vehicle_types_breakdown || reportsData.vehicle_types_breakdown.length === 0) ? (
                  <div className="admin-empty-state">
                    <div className="admin-empty-title">No Classification Data</div>
                    <div className="admin-empty-desc">Classification shares will appear as vehicles are registered.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reportsData.vehicle_types_breakdown.map((item: any, idx: number) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>{item.type}</span>
                          <span className="admin-mono" style={{ fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                            {item.count} ({item.share_percent}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, backgroundColor: 'var(--admin-surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${item.share_percent}%`, height: '100%', backgroundColor: 'var(--admin-brand-accent)', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transit Corridors */}
              <div className="admin-card">
                <h3 className="admin-card-title" style={{ marginBottom: 16 }}>
                  Monitored Ghana Transit Corridors
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(reportsData?.corridor_traffic_metrics || [
                    { corridor: 'Tema Motorway & Port Artery', speed_limit_kmh: 90 },
                    { corridor: 'Kwame Nkrumah Interchange (Circle)', speed_limit_kmh: 50 },
                    { corridor: 'Mallam - Kasoa Highway', speed_limit_kmh: 80 },
                    { corridor: 'Achimota - Neoplan Terminal Artery', speed_limit_kmh: 50 },
                  ]).map((c: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: 'var(--admin-surface-subtle)',
                        borderRadius: 'var(--admin-radius-sm)',
                        border: '1px solid var(--admin-border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--admin-text-primary)' }}>
                          {c.corridor}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                          Corridor Speed Limit: {c.speed_limit_kmh} km/h
                        </div>
                      </div>
                      <span className="admin-pill admin-pill-success">Operational</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────
          MODAL 1: USER / ORGANISATION MANAGEMENT
      ───────────────────────────────────────────── */}
      {selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                  {selectedUser.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                  {selectedUser.organization} · Account: {selectedUser.id.slice(0, 16)}...
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setAssignGpsSuccessMsg(''); setAssignGpsErrorMsg(''); }}
                className="admin-btn admin-btn-ghost admin-btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Details Overview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                padding: 14,
                backgroundColor: 'var(--admin-surface-subtle)',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border-subtle)',
                marginBottom: 20,
              }}>
                <div>
                  <div className="admin-label">Email Address</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedUser.email || 'None on file'}</div>
                </div>
                <div>
                  <div className="admin-label">Contact Phone</div>
                  <div className="admin-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedUser.phone}</div>
                </div>
                <div>
                  <div className="admin-label">Registered Fleet</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-brand-accent)' }}>
                    {selectedUserVehicles.length} vehicles
                  </div>
                </div>
              </div>

              {/* Vehicles Owned Section */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                    Assigned Fleet Vehicles ({selectedUserVehicles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(true)}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Plus size={12} /> Add Vehicle
                  </button>
                </div>

                {selectedUserVehicles.length === 0 ? (
                  <div className="admin-empty-state" style={{ padding: '20px' }}>
                    <div className="admin-empty-desc">No vehicles currently linked to this organisation.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedUserVehicles.map((uv) => (
                      <div
                        key={uv.id}
                        style={{
                          padding: '10px 14px',
                          border: '1px solid var(--admin-border-subtle)',
                          borderRadius: 'var(--admin-radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--admin-surface-subtle)',
                        }}
                      >
                        <div>
                          <div className="admin-mono" style={{ fontWeight: 700, color: 'var(--admin-brand-accent)' }}>
                            {uv.plate_number} · {uv.make} {uv.model}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>
                            Driver: {uv.driver_name} · Type: {uv.vehicle_type}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="admin-mono" style={{ fontSize: '0.75rem', color: uv.gps_tracker_imei && uv.gps_tracker_imei !== 'UNASSIGNED' ? 'var(--admin-success-text)' : 'var(--admin-text-muted)' }}>
                            {uv.gps_tracker_imei && uv.gps_tracker_imei !== 'UNASSIGNED' ? uv.gps_tracker_imei : 'No Tracker'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAssignGpsVehicleId(uv.id);
                              setAssignGpsPlate(uv.plate_number);
                              setAssignGpsImei(uv.gps_tracker_imei !== 'UNASSIGNED' ? (uv.gps_tracker_imei || '') : '');
                            }}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            Configure GPS
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Hardware Provisioning Box */}
              <div style={{
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-md)',
                padding: '18px',
                backgroundColor: 'var(--admin-surface-raised)',
              }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                  Provision GPS Telematics Hardware
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Configure hardware tracker IMEI and reporting interval for Traccar and GT06 telemetry.
                </p>

                {assignGpsSuccessMsg && (
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--admin-success-subtle)', color: 'var(--admin-success-text)', fontSize: '0.75rem', borderRadius: 6, marginBottom: 12 }}>
                    {assignGpsSuccessMsg}
                  </div>
                )}

                {assignGpsErrorMsg && (
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--admin-danger-subtle)', color: 'var(--admin-danger-text)', fontSize: '0.75rem', borderRadius: 6, marginBottom: 12 }}>
                    {assignGpsErrorMsg}
                  </div>
                )}

                <form onSubmit={handleAssignGpsSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="admin-label">Vehicle</label>
                      <select
                        value={assignGpsPlate}
                        onChange={(e) => {
                          setAssignGpsPlate(e.target.value);
                          const v = vehicles.find(x => x.plate_number === e.target.value);
                          if (v) setAssignGpsVehicleId(v.id);
                        }}
                        required
                        className="admin-select"
                      >
                        <option value="">Choose Vehicle</option>
                        {selectedUserVehicles.map(v => (
                          <option key={v.id} value={v.plate_number}>
                            {v.plate_number} ({v.make} {v.model})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="admin-label">Tracker IMEI (15 Digits)</label>
                      <input
                        type="text"
                        placeholder="864201049281700"
                        value={assignGpsImei}
                        onChange={(e) => setAssignGpsImei(e.target.value)}
                        required
                        className="admin-input admin-mono"
                      />
                    </div>

                    <div>
                      <label className="admin-label">Protocol</label>
                      <select
                        value={assignGpsProtocol}
                        onChange={(e) => setAssignGpsProtocol(e.target.value)}
                        className="admin-select"
                      >
                        <option value="GT06">GT06 / Accurate Tracker</option>
                        <option value="TK103">TK103 / Coban</option>
                        <option value="Teltonika">Teltonika (FMB920)</option>
                        <option value="OsmAnd">ProMove Mobile Telematics</option>
                      </select>
                    </div>

                    <div>
                      <label className="admin-label">Reporting Interval</label>
                      <select
                        value={assignGpsInterval}
                        onChange={(e) => setAssignGpsInterval(e.target.value)}
                        className="admin-select"
                      >
                        <option value="10">10 Seconds (High Precision)</option>
                        <option value="30">30 Seconds (Standard Fleet)</option>
                        <option value="60">60 Seconds (Economy Data)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="submit"
                      disabled={assignGpsSubmitting}
                      className="admin-btn admin-btn-primary admin-btn-sm"
                    >
                      {assignGpsSubmitting ? 'Saving Configuration...' : 'Save & Link GPS Tracker'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 2: VEHICLE TELEMATICS INSPECTION
      ───────────────────────────────────────────── */}
      {selectedVehicle && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="admin-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-brand-accent)' }}>
                    {selectedVehicle.plate_number}
                  </span>
                  <span className={`admin-pill ${selectedVehicle.status === 'moving' ? 'admin-pill-success' : 'admin-pill-neutral'}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year}) · Operator: {selectedVehicle.owner_name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="admin-btn admin-btn-ghost admin-btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Telematics Location */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--admin-surface-subtle)',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border-subtle)',
                marginBottom: 16,
              }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                  Telematics Location Status
                </h4>
                {selectedVehicle.live_location ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div>
                      <div className="admin-label">Corridor Route</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {selectedVehicle.live_location.location_label}
                      </div>
                    </div>
                    <div>
                      <div className="admin-label">Coordinates</div>
                      <div className="admin-mono" style={{ fontSize: '0.8125rem' }}>
                        {selectedVehicle.live_location.latitude.toFixed(4)}, {selectedVehicle.live_location.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="admin-label">Speed & Ignition</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {selectedVehicle.live_location.speed_kmh} km/h · Ignition {selectedVehicle.live_location.ignition ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    <div>
                      <div className="admin-label">Battery Level</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {selectedVehicle.live_location.battery_percentage}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
                    No live GPS blip currently registered for this vehicle. Ensure device is powered and provisioned.
                  </div>
                )}
              </div>

              {/* Driver & Specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                padding: 16,
                backgroundColor: 'var(--admin-surface-subtle)',
                borderRadius: 'var(--admin-radius-md)',
                border: '1px solid var(--admin-border-subtle)',
              }}>
                <div>
                  <div className="admin-label">Assigned Driver</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedVehicle.driver_name}</div>
                  {selectedVehicle.driver_phone && (
                    <div className="admin-mono" style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>
                      {selectedVehicle.driver_phone}
                    </div>
                  )}
                </div>
                <div>
                  <div className="admin-label">Vehicle Classification</div>
                  <div style={{ fontSize: '0.8125rem', textTransform: 'capitalize' }}>
                    {selectedVehicle.vehicle_type} · {selectedVehicle.seats} seats · {selectedVehicle.fuel_type}
                  </div>
                </div>
                <div>
                  <div className="admin-label">Provisioned Tracker IMEI</div>
                  <div className="admin-mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-brand-accent)' }}>
                    {selectedVehicle.gps_tracker_imei}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 3: RESOLVE INCIDENT
      ───────────────────────────────────────────── */}
      {resolvingIncident && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                Resolve Incident: {resolvingIncident.plate_number}
              </h3>
              <button
                type="button"
                onClick={() => setResolvingIncident(null)}
                className="admin-btn admin-btn-ghost admin-btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResolveIncidentSubmit}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', margin: '0 0 14px' }}>
                  {resolvingIncident.description}
                </p>

                <div className="admin-input-group">
                  <label className="admin-label">Resolution Notes</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter operator resolution details..."
                    rows={4}
                    required
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setResolvingIncident(null)}
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingSubmitting}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  {resolvingSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 4: ADD VEHICLE FOR USER
      ───────────────────────────────────────────── */}
      {showAddVehicleModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 520 }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                  Register Vehicle for {selectedUser?.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                  Register vehicle record under {selectedUser?.organization}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="admin-btn admin-btn-ghost admin-btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="admin-label">Plate Number</label>
                    <input
                      type="text"
                      placeholder="e.g. GE 4421-23"
                      value={newVehPlate}
                      onChange={(e) => setNewVehPlate(e.target.value)}
                      required
                      className="admin-input admin-mono"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Vehicle Type</label>
                    <select
                      value={newVehType}
                      onChange={(e) => setNewVehType(e.target.value)}
                      className="admin-select"
                    >
                      <option value="trotro">Trotro</option>
                      <option value="taxi">Taxi</option>
                      <option value="bus">Bus</option>
                      <option value="hauling">Hauling Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Make</label>
                    <input
                      type="text"
                      value={newVehMake}
                      onChange={(e) => setNewVehMake(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Model</label>
                    <input
                      type="text"
                      value={newVehModel}
                      onChange={(e) => setNewVehModel(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kwame Boakye"
                      value={newVehDriverName}
                      onChange={(e) => setNewVehDriverName(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Driver Phone</label>
                    <input
                      type="text"
                      placeholder="+233 24 000 0000"
                      value={newVehDriverPhone}
                      onChange={(e) => setNewVehDriverPhone(e.target.value)}
                      className="admin-input admin-mono"
                    />
                  </div>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">GPS Device IMEI (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 864201049281728"
                    value={newVehImei}
                    onChange={(e) => setNewVehImei(e.target.value)}
                    className="admin-input admin-mono"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVehicleSubmitting}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  {addingVehicleSubmitting ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
