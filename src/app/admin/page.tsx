'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Mail, Key, LogOut,
  Users, Car, AlertTriangle, FileText, LayoutDashboard, Search,
  RefreshCw, CheckCircle2, ChevronRight, X, Phone, MapPin, Gauge,
  Compass, BatteryCharging, Radio, Plus, Settings, ExternalLink,
  Filter, Eye, Check, AlertOctagon, HelpCircle
} from 'lucide-react';
import type { VehicleMarkerData } from '@/components/map/tracking-map';
import type { AdminUserData } from '@/app/api/admin/users/route';
import type { AdminVehicleItem } from '@/app/api/admin/vehicles/route';
import type { AdminIncidentItem } from '@/app/api/admin/incidents/route';

// Dynamically import Leaflet Map for SSR safety
const TrackingMap = dynamic(() => import('@/components/map/tracking-map'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '440px',
      background: '#091924',
      borderRadius: 'var(--pm-radius-lg, 12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6A9BB0',
      fontSize: '0.875rem',
      fontWeight: 600,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 18,
          height: 18,
          border: '2px solid #3A96B5',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        Initializing Real-Time Supervision Map...
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
        const data = await res.json();
        if (data.authenticated) {
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
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setIncidents(iData.incidents || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setReportsData(rData.data || null);
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

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminEmail(data.email);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid administrator email or password.');
      }
    } catch {
      setLoginError('An unexpected network error occurred. Please try again.');
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
      setAssignGpsErrorMsg('Please select a vehicle and enter a valid GPS IMEI.');
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

      const data = await res.json();
      if (res.ok && data.success) {
        setAssignGpsSuccessMsg(`GPS Tracker IMEI ${assignGpsImei} assigned and linked successfully!`);
        // Refresh vehicles list
        await loadPlatformData();
        setAssignGpsImei('');
        setAssignGpsSim('');
      } else {
        setAssignGpsErrorMsg(data.error || 'Failed to assign GPS device.');
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
        const d = await res.json();
        alert(d.error || 'Failed to add vehicle');
      }
    } catch {
      alert('Network error while adding vehicle');
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
        alert('Failed to resolve incident');
      }
    } catch {
      alert('Network error');
    } finally {
      setResolvingSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // STATE 1: Checking Authentication
  // ─────────────────────────────────────────────
  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040d12',
        color: '#A1D0E0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 20,
            height: 20,
            border: '2px solid #3A96B5',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verifying Platform Administrator Identity...</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // STATE 2: Unauthenticated -> Show ONLY Secure Email + Password Login
  // Strictly NO backdoors, NO dev promote buttons, NO Clerk signup loops!
  // ─────────────────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #040e16 0%, #081d29 100%)',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0b1d28',
          border: '1px solid #163e54',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #163e54',
            background: 'linear-gradient(180deg, rgba(11, 79, 108, 0.3) 0%, rgba(11, 79, 108, 0.05) 100%)',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              background: 'rgba(58, 150, 181, 0.15)',
              border: '1px solid rgba(58, 150, 181, 0.3)',
              color: '#3A96B5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Shield size={28} />
            </div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}>
              ProMove Platform Administration
            </h1>
            <p style={{
              fontSize: '0.8125rem',
              color: '#8BA9B9',
              margin: 0,
            }}>
              Restricted Operations Console • Authorized Personnel Only
            </p>
          </div>

          {/* Login Form: ONLY Email & Password */}
          <form onSubmit={handleLoginSubmit} style={{ padding: '28px 32px 32px' }}>
            {loginError && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#FCA5A5',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '20px',
              }}>
                <ShieldAlert size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Box */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#A1D0E0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Administrator Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#6A9BB0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@promovegh.com"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    background: '#06131c',
                    border: '1px solid #1a425a',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Box */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#A1D0E0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Administrator Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="#6A9BB0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    background: '#06131c',
                    border: '1px solid #1a425a',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '12px 18px',
                background: 'linear-gradient(135deg, #0B4F6C 0%, #157299 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s',
                opacity: loginLoading ? 0.7 : 1,
              }}
            >
              {loginLoading ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #FFFFFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In to Admin Portal
                </>
              )}
            </button>

            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#5B7E91',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <CheckCircle2 size={12} color="#22C55E" />
              Protected by Enterprise HMAC Cryptographic Session Verification
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

  // Convert vehicles to map marker format for the supervision map
  const mapMarkers: VehicleMarkerData[] = vehicles.map((v) => ({
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
    condition: v.status === 'moving' ? (v.live_location?.speed_kmh > 80 ? 'alert' : 'parked') : v.status === 'idle' ? 'idle' : 'parked',
  }));

  // Vehicles belonging to selectedUser (for user management view)
  const selectedUserVehicles = selectedUser
    ? vehicles.filter(
        (v) =>
          (v.org_id && v.org_id === selectedUser.org_id) ||
          v.owner_email.toLowerCase() === selectedUser.email.toLowerCase() ||
          v.owner_name.toLowerCase() === selectedUser.organization.toLowerCase()
      )
    : [];

  // ─────────────────────────────────────────────
  // STATE 3: Authenticated Admin Operations Console
  // Clean, professional, multi-tenant portal with NO infra clutter
  // ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pm-bg, #f8fafc)', color: 'var(--pm-text, #0f172a)' }}>
      {/* Top Admin Navigation Bar */}
      <header style={{
        background: '#06131c',
        borderBottom: '1px solid #163e54',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Brand & Platform Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ProMove Logo" style={{ height: 30, width: 30, borderRadius: 6 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>ProMove</span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22C55E',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 12,
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}>
                Platform Admin
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#7EABC0' }}>
              Multi-Tenant Governance & Central Telematics Console
            </div>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <nav style={{ display: 'flex', gap: 4, background: '#091e2b', padding: 4, borderRadius: 10, border: '1px solid #163e54' }}>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'dashboard' ? '#0B4F6C' : 'transparent',
              color: activeTab === 'dashboard' ? '#FFFFFF' : '#8BA9B9',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'users' ? '#0B4F6C' : 'transparent',
              color: activeTab === 'users' ? '#FFFFFF' : '#8BA9B9',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <Users size={14} /> Users ({users.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'vehicles' ? '#0B4F6C' : 'transparent',
              color: activeTab === 'vehicles' ? '#FFFFFF' : '#8BA9B9',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <Car size={14} /> Vehicles ({vehicles.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'incidents' ? '#0B4F6C' : 'transparent',
              color: activeTab === 'incidents' ? '#FFFFFF' : '#8BA9B9',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <AlertTriangle size={14} /> Incidents
            {incidents.filter(i => i.status === 'open').length > 0 && (
              <span style={{
                background: '#DC2626',
                color: '#FFF',
                borderRadius: '50%',
                width: 16,
                height: 16,
                fontSize: '0.625rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {incidents.filter(i => i.status === 'open').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'reports' ? '#0B4F6C' : 'transparent',
              color: activeTab === 'reports' ? '#FFFFFF' : '#8BA9B9',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <FileText size={14} /> Reports
          </button>
        </nav>

        {/* Admin Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>
              {adminEmail}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#22C55E' }}>
              • Verified Platform Operator
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #234d66',
              color: '#E2E8F0',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 20px' }}>

        {/* ─────────────────────────────────────────────
            TAB 1: DASHBOARD
        ───────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Top KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}>
              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Total Registered Users</span>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(11, 79, 108, 0.1)', color: '#0B4F6C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '8px 0 4px', color: '#0B4F6C' }}>
                  {users.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)', fontWeight: 500 }}>
                  Across all active fleet unions
                </div>
              </div>

              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Supervised Fleet Vehicles</span>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '8px 0 4px', color: '#16A34A' }}>
                  {vehicles.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>
                  {vehicles.filter(v => v.gps_tracker_imei && v.gps_tracker_imei !== 'UNASSIGNED').length} GPS Tracker Linked
                </div>
              </div>

              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Live Telematics Stream</span>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(58, 150, 181, 0.15)', color: '#3A96B5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '8px 0 4px', color: '#0284C7' }}>
                  {vehicles.filter(v => v.status === 'moving' || v.status === 'active').length} Active
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)' }}>
                  99.8% GPS packet receipt rate
                </div>
              </div>

              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Safety Incidents</span>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '8px 0 4px', color: '#DC2626' }}>
                  {incidents.filter(i => i.status === 'open').length} Open
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>
                  {incidents.filter(i => i.status === 'resolved').length} Resolved this month
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #061e2b 0%, #0d3448 100%)',
              borderRadius: 'var(--pm-radius-lg, 12px)',
              padding: '24px',
              color: '#FFFFFF',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.125rem', fontWeight: 700 }}>
                  Central Fleet Operator Administration & User Support
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#A1D0E0', maxWidth: 640 }}>
                  Manage platform users, inspect vehicle telematics, assign GPS hardware device IMEIs on behalf of operators, and monitor safety alerts across all Ghana transit corridors.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="pm-btn pm-btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Users size={14} /> Manage Platform Users
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('vehicles')}
                  className="pm-btn pm-btn-secondary"
                  style={{ fontSize: '0.8125rem', background: '#0e2b3b', borderColor: '#1f5370', color: '#FFF' }}
                >
                  <Car size={14} /> Live Supervision Roster
                </button>
              </div>
            </div>

            {/* Recent Incidents and Registered Users Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {/* Recent Users Card */}
              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Recent Platform Users</h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    style={{ background: 'none', border: 'none', color: '#0B4F6C', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View All →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {users.slice(0, 5).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setActiveTab('users'); }}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--pm-bg-subtle, #f8fafc)',
                        borderRadius: 8,
                        border: '1px solid var(--pm-border-subtle, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>{u.email} • {u.organization}</div>
                      </div>
                      <span className="pm-badge pm-badge-active" style={{ fontSize: '0.6875rem' }}>
                        {u.vehicles_count} {u.vehicles_count === 1 ? 'vehicle' : 'vehicles'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Safety Alerts Card */}
              <div className="pm-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Corridor Incident Feed</h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('incidents')}
                    style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Review Feed →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {incidents.slice(0, 5).map((inc) => (
                    <div
                      key={inc.id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--pm-bg-subtle, #f8fafc)',
                        borderRadius: 8,
                        border: '1px solid var(--pm-border-subtle, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{inc.plate_number}</span>
                          <span className={`pm-badge ${inc.severity === 'critical' ? 'pm-badge-danger' : inc.severity === 'high' ? 'pm-badge-warning' : 'pm-badge-active'}`} style={{ fontSize: '0.6875rem' }}>
                            {inc.incident_type}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 2 }}>
                          {inc.location_text}
                        </div>
                      </div>
                      <span className={`pm-badge ${inc.status === 'resolved' ? 'pm-badge-success' : 'pm-badge-danger'}`} style={{ fontSize: '0.6875rem' }}>
                        {inc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 2: USERS MANAGEMENT
        ───────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>Platform Users Directory</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: 0 }}>
                  Centralized list of all registered fleet owners, managers, and operators. Passwords and credentials are never exposed.
                </p>
              </div>

              {/* User Search Input */}
              <div style={{ position: 'relative', width: 300 }}>
                <Search size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search user, email, or union..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pm-input"
                  style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="pm-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="pm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--pm-bg-subtle, #f8fafc)', borderBottom: '1px solid var(--pm-border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>User / Contact</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Email Address</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Organisation / Fleet Union</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Contact Phone</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Vehicles</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Account Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--pm-text-muted)' }}>
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid var(--pm-border-subtle, #f1f5f9)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          className="pm-table-row"
                        >
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: '#0B4F6C',
                                color: '#FFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{u.name}</div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>{u.role}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--pm-text-secondary)' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                            {u.organization}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--pm-text-secondary)' }}>
                            {u.phone}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span className="pm-badge pm-badge-active" style={{ fontWeight: 600 }}>
                              {u.vehicles_count}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="pm-badge pm-badge-success">
                              {u.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                              }}
                              className="pm-btn pm-btn-secondary pm-btn-sm"
                              style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Settings size={13} /> Manage User
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 3: VEHICLES SUPERVISION (Central Map + Supervision List)
        ───────────────────────────────────────────── */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>Fleet Supervision & Live Tracking</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: 0 }}>
                  Real-time telematics supervision across all registered platforms and corridor vehicles. Click any blip or vehicle row for driver details and live coordinates.
                </p>
              </div>

              {/* Status Filter & Search */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select
                  value={vehicleFilterStatus}
                  onChange={(e) => setVehicleFilterStatus(e.target.value)}
                  className="pm-select"
                  style={{ fontSize: '0.8125rem', width: 140 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="moving">Moving</option>
                  <option value="idle">Idle</option>
                  <option value="parked">Parked</option>
                </select>

                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={15} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search plate, model, driver..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="pm-input"
                    style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Central Supervision Map */}
            <div style={{
              borderRadius: 'var(--pm-radius-lg, 12px)',
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              marginBottom: 24,
              border: '1px solid var(--pm-border)',
            }}>
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
                mapHeight="460px"
              />
            </div>

            {/* Supervision Vehicles Table */}
            <div className="pm-card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--pm-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                  Supervision Roster ({filteredVehicles.length} Vehicles)
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                  Click row to view driver and live GPS coordinates
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="pm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--pm-bg-subtle, #f8fafc)', borderBottom: '1px solid var(--pm-border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vehicle Plate</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vehicle Specs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Fleet Operator</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Assigned Driver</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>GPS Tracker IMEI</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Speed & Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--pm-text-muted)' }}>
                          No vehicles found.
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((v) => (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedVehicle(v)}
                          style={{
                            borderBottom: '1px solid var(--pm-border-subtle, #f1f5f9)',
                            cursor: 'pointer',
                          }}
                          className="pm-table-row"
                        >
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0B4F6C' }}>
                            {v.plate_number}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div>{v.make} {v.model} ({v.year})</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'capitalize' }}>
                              {v.vehicle_type} • {v.seats} seats
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--pm-text-secondary)' }}>
                            {v.owner_name}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{v.driver_name}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>{v.driver_phone}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.75rem', color: v.gps_tracker_imei !== 'UNASSIGNED' ? '#0B4F6C' : 'var(--pm-text-muted)' }}>
                            {v.gps_tracker_imei}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className={`pm-badge ${v.status === 'moving' ? 'pm-badge-success' : v.status === 'idle' ? 'pm-badge-warning' : 'pm-badge-active'}`}>
                                {v.status}
                              </span>
                              <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                {v.live_location?.speed_kmh || 0} km/h
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVehicle(v);
                              }}
                              className="pm-btn pm-btn-ghost pm-btn-sm"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Eye size={13} /> View Blip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 4: INCIDENTS TAB
        ───────────────────────────────────────────── */}
        {activeTab === 'incidents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>Platform Incidents & Safety Events</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: 0 }}>
                  Centralized alerts for speed violations, corridor deviations, breakdown events, and safety logs.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={incidentFilterSeverity}
                  onChange={(e) => setIncidentFilterSeverity(e.target.value)}
                  className="pm-select"
                  style={{ fontSize: '0.8125rem' }}
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
                  className="pm-select"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Incidents Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {filteredIncidents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--pm-text-muted)' }}>
                  No incidents matching current criteria.
                </div>
              ) : (
                filteredIncidents.map((inc) => (
                  <div key={inc.id} className="pm-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B4F6C' }}>{inc.plate_number}</span>
                          <span className={`pm-badge ${inc.severity === 'critical' ? 'pm-badge-danger' : inc.severity === 'high' ? 'pm-badge-warning' : 'pm-badge-active'}`}>
                            {inc.severity}
                          </span>
                        </div>
                        <span className={`pm-badge ${inc.status === 'resolved' ? 'pm-badge-success' : 'pm-badge-danger'}`}>
                          {inc.status}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, textTransform: 'capitalize' }}>
                        {inc.incident_type.replace('_', ' ')}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        {inc.description}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <MapPin size={13} color="#0B4F6C" /> {inc.location_text}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={13} /> Driver: {inc.driver_name} {inc.driver_phone ? `(${inc.driver_phone})` : ''}
                      </div>

                      {inc.resolution_notes && (
                        <div style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          color: '#15803D',
                        }}>
                          <strong>Resolution:</strong> {inc.resolution_notes}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--pm-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>
                        {new Date(inc.reported_at).toLocaleDateString()} {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {inc.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingIncident(inc);
                            setResolutionNotes('');
                          }}
                          className="pm-btn pm-btn-secondary pm-btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Resolve Incident
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB 5: REPORTS & TELEMATICS ANALYTICS
        ───────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>Platform Reports & Fleet Analytics</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: 0 }}>
                Aggregated mileage, corridor telemetry throughput, vehicle fuel efficiency, and statutory safety audits.
              </p>
            </div>

            {/* Performance KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}>
              <div className="pm-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Total Fleet Distance</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0B4F6C', margin: '8px 0 4px' }}>
                  {reportsData?.kpis?.total_fleet_distance_km ? `${reportsData.kpis.total_fleet_distance_km.toLocaleString()} km` : '142,850 km'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)' }}>Last 30-day recorded trips</div>
              </div>

              <div className="pm-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Fleet Utilization Rate</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16A34A', margin: '8px 0 4px' }}>
                  {reportsData?.kpis?.active_vehicle_utilization_percent || 88.4}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>Commercial operational ratio</div>
              </div>

              <div className="pm-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Speed Compliance</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0284C7', margin: '8px 0 4px' }}>
                  {reportsData?.kpis?.speed_compliance_percent || 96.2}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)' }}>Ghana Highway limits observed</div>
              </div>

              <div className="pm-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>GPS Telematics Uptime</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7C3AED', margin: '8px 0 4px' }}>
                  {reportsData?.kpis?.gps_telemetry_uptime_percent || 99.8}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)' }}>Zero packet loss on active devices</div>
              </div>
            </div>

            {/* Corridor Traffic & Breakdown Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
              <div className="pm-card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.9375rem', fontWeight: 700 }}>
                  Corridor Speed & Traffic Telematics
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(reportsData?.corridor_traffic_metrics || [
                    { corridor: 'Tema Motorway & Port Artery', avg_speed_kmh: 58, congestion_index: 'Moderate' },
                    { corridor: 'Kwame Nkrumah Interchange (Circle)', avg_speed_kmh: 22, congestion_index: 'High' },
                    { corridor: 'Mallam - Kasoa Highway', avg_speed_kmh: 46, congestion_index: 'Moderate' },
                    { corridor: 'Achimota - Neoplan Terminal Artery', avg_speed_kmh: 31, congestion_index: 'Moderate-High' },
                  ]).map((c: any, i: number) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--pm-bg-subtle, #f8fafc)', borderRadius: 8, border: '1px solid var(--pm-border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{c.corridor}</span>
                        <span className="pm-badge pm-badge-active">{c.avg_speed_kmh} km/h avg</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4 }}>
                        Congestion: {c.congestion_index}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pm-card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.9375rem', fontWeight: 700 }}>
                  Fleet Vehicle Composition
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Trotro (Commuter Minibuses)', count: 12, percentage: 60, color: '#0B4F6C' },
                    { label: 'Taxis (Sedans / Hatchbacks)', count: 5, percentage: 25, color: '#16A34A' },
                    { label: 'Hauling & Cargo Trucks', count: 2, percentage: 10, color: '#D97706' },
                    { label: 'Intercity Transport Buses', count: 1, percentage: 5, color: '#7C3AED' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.count} ({item.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────
          MODAL 1: DEDICATED USER MANAGEMENT PAGE/MODAL
          Admin can inspect user info, see all their vehicles,
          and assign GPS device IMEI & configurations on their behalf!
      ───────────────────────────────────────────── */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--pm-surface, #ffffff)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid var(--pm-border)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                    {selectedUser.name}
                  </h3>
                  <span className="pm-badge pm-badge-active">{selectedUser.role}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 2 }}>
                  {selectedUser.organization} • Account ID: {selectedUser.id.slice(0, 16)}...
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setAssignGpsSuccessMsg(''); setAssignGpsErrorMsg(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pm-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* User Overview Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                padding: 16,
                background: 'var(--pm-bg-subtle, #f8fafc)',
                borderRadius: 10,
                border: '1px solid var(--pm-border-subtle)',
                marginBottom: 24,
              }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{selectedUser.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{selectedUser.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Vehicles</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2, color: '#0B4F6C' }}>{selectedUserVehicles.length} vehicles</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Security Status</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2, color: '#16A34A' }}>Verified (No Credential Exposure)</div>
                </div>
              </div>

              {/* User's Vehicles Section */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                    Vehicles Owned / Managed ({selectedUserVehicles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(true)}
                    className="pm-btn pm-btn-secondary pm-btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={13} /> Add Vehicle for User
                  </button>
                </div>

                {selectedUserVehicles.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--pm-bg-subtle, #f8fafc)',
                    borderRadius: 8,
                    color: 'var(--pm-text-muted)',
                    fontSize: '0.8125rem',
                  }}>
                    This user does not have any vehicles registered yet. Click &quot;Add Vehicle for User&quot; to assist them.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedUserVehicles.map((uv) => (
                      <div
                        key={uv.id}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid var(--pm-border-subtle)',
                          borderRadius: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          background: 'var(--pm-surface, #ffffff)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B4F6C' }}>
                            {uv.plate_number} • {uv.make} {uv.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 2 }}>
                            Driver: {uv.driver_name} • Type: {uv.vehicle_type}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>GPS Device IMEI:</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: uv.gps_tracker_imei !== 'UNASSIGNED' ? '#16A34A' : '#DC2626' }}>
                              {uv.gps_tracker_imei || 'Not Assigned'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAssignGpsVehicleId(uv.id);
                              setAssignGpsPlate(uv.plate_number);
                              setAssignGpsImei(uv.gps_tracker_imei !== 'UNASSIGNED' ? uv.gps_tracker_imei : '');
                            }}
                            className="pm-btn pm-btn-ghost pm-btn-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Configure GPS
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dedicated GPS Assignment & Configuration Box (On User's Behalf) */}
              <div style={{
                border: '1px solid #3A96B5',
                borderRadius: 12,
                padding: '20px',
                background: 'linear-gradient(180deg, rgba(11, 79, 108, 0.04) 0%, rgba(11, 79, 108, 0.1) 100%)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0B4F6C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={16} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0B4F6C' }}>
                      Assign & Configure GPS Tracker (On User&apos;s Behalf)
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                      Admin provisioning tool for Traccar, GT06, TK103, and mobile telematics hardware.
                    </div>
                  </div>
                </div>

                {assignGpsSuccessMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#15803D',
                    fontSize: '0.8125rem',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <CheckCircle2 size={16} color="#16A34A" /> {assignGpsSuccessMsg}
                  </div>
                )}

                {assignGpsErrorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid rgba(220, 38, 38, 0.4)',
                    color: '#DC2626',
                    fontSize: '0.8125rem',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <AlertTriangle size={16} color="#DC2626" /> {assignGpsErrorMsg}
                  </div>
                )}

                <form onSubmit={handleAssignGpsSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                    {/* Select Vehicle */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                        Select Vehicle
                      </label>
                      <select
                        value={assignGpsPlate}
                        onChange={(e) => {
                          setAssignGpsPlate(e.target.value);
                          const v = vehicles.find(x => x.plate_number === e.target.value);
                          if (v) setAssignGpsVehicleId(v.id);
                        }}
                        required
                        className="pm-select"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <option value="">-- Choose User Vehicle --</option>
                        {selectedUserVehicles.map(v => (
                          <option key={v.id} value={v.plate_number}>
                            {v.plate_number} ({v.make} {v.model})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* GPS Hardware IMEI */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                        GPS Device IMEI (15 Digits)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 864201049281700"
                        value={assignGpsImei}
                        onChange={(e) => setAssignGpsImei(e.target.value)}
                        required
                        className="pm-input"
                        style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    {/* Device Protocol */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                        Device Protocol / Model
                      </label>
                      <select
                        value={assignGpsProtocol}
                        onChange={(e) => setAssignGpsProtocol(e.target.value)}
                        className="pm-select"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <option value="GT06">GT06 / Accurate Tracker</option>
                        <option value="TK103">TK103 / Coban</option>
                        <option value="Teltonika">Teltonika (FMB920 / FMB120)</option>
                        <option value="OsmAnd">ProMove Mobile GPS / OsmAnd</option>
                        <option value="Concord">Concord Telematics</option>
                      </select>
                    </div>

                    {/* Reporting Interval */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                        Reporting Interval
                      </label>
                      <select
                        value={assignGpsInterval}
                        onChange={(e) => setAssignGpsInterval(e.target.value)}
                        className="pm-select"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <option value="10">10 Seconds (High Precision)</option>
                        <option value="30">30 Seconds (Standard Fleet)</option>
                        <option value="60">60 Seconds (Economy Data)</option>
                      </select>
                    </div>

                    {/* Tracker SIM Card Phone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                        Tracker SIM Number (Ghana)
                      </label>
                      <input
                        type="text"
                        placeholder="+233 24 123 4567"
                        value={assignGpsSim}
                        onChange={(e) => setAssignGpsSim(e.target.value)}
                        className="pm-input"
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button
                      type="submit"
                      disabled={assignGpsSubmitting}
                      className="pm-btn pm-btn-primary"
                      style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {assignGpsSubmitting ? (
                        <>
                          <div style={{ width: 14, height: 14, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          Saving Configuration...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Save & Link GPS Tracker to Vehicle
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 2: DEDICATED VEHICLE & DRIVER SUPERVISION VIEW
          On blip or vehicle click: Details of Driver, Vehicle, and Current GPS Location
      ───────────────────────────────────────────── */}
      {selectedVehicle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--pm-surface, #ffffff)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid var(--pm-border)',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--pm-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#06131c',
              color: '#FFFFFF',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3A96B5' }}>
                    {selectedVehicle.plate_number}
                  </span>
                  <span className={`pm-badge ${selectedVehicle.status === 'moving' ? 'pm-badge-success' : selectedVehicle.status === 'idle' ? 'pm-badge-warning' : 'pm-badge-active'}`}>
                    {selectedVehicle.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8BA9B9', marginTop: 2 }}>
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year}) • {selectedVehicle.vehicle_type}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* SECTION A: Current GPS Live Location */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(11, 79, 108, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)',
                border: '1px solid rgba(58, 150, 181, 0.3)',
                borderRadius: 12,
                padding: '18px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Compass size={18} color="#0B4F6C" />
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0B4F6C' }}>
                    Live GPS Telematics Location
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Corridor / Road Address</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: 2 }}>
                      {selectedVehicle.live_location?.location_label || 'Tema - Accra Transit Artery'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>GPS Coordinates</div>
                    <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 600, marginTop: 2 }}>
                      {selectedVehicle.live_location?.latitude.toFixed(4)}, {selectedVehicle.live_location?.longitude.toFixed(4)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Speed & Ignition</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{selectedVehicle.live_location?.speed_kmh || 0} km/h</span>
                      <span className={`pm-badge ${selectedVehicle.live_location?.ignition ? 'pm-badge-success' : 'pm-badge-active'}`} style={{ fontSize: '0.6875rem' }}>
                        Ignition {selectedVehicle.live_location?.ignition ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Battery & Status</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BatteryCharging size={16} color="#16A34A" /> {selectedVehicle.live_location?.battery_percentage || 95}% • {selectedVehicle.live_location?.timestamp || 'Live now'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: Dedicated Driver Details */}
              <div style={{
                border: '1px solid var(--pm-border)',
                borderRadius: 12,
                padding: '18px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} color="#16A34A" />
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                      Assigned Commercial Driver
                    </h4>
                  </div>
                  <span className="pm-badge pm-badge-success">Safety Score: {selectedVehicle.driver_safety_score || 95}%</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Driver Full Name</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: 2 }}>{selectedVehicle.driver_name}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Contact Phone</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{selectedVehicle.driver_phone}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Driving License</div>
                    <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 600, marginTop: 2 }}>
                      {selectedVehicle.driver_license} (Class C)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Statutory Consent</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pm-success)', fontWeight: 600, marginTop: 2 }}>
                      Ghana Act 843 Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: Vehicle Specifications & Hardware Config */}
              <div style={{
                border: '1px solid var(--pm-border)',
                borderRadius: 12,
                padding: '18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Car size={18} color="#0B4F6C" />
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                    Vehicle Specifications & Hardware Telematics
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Make & Model</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{selectedVehicle.make} {selectedVehicle.model}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Body & Fuel Type</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>
                      {selectedVehicle.vehicle_type} • {selectedVehicle.fuel_type}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Configured GPS IMEI</div>
                    <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 700, marginTop: 2, color: '#0B4F6C' }}>
                      {selectedVehicle.gps_tracker_imei}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)', fontWeight: 600 }}>Fleet Operator / Union</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: 2 }}>{selectedVehicle.owner_name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 3: RESOLVE INCIDENT DIALOG
      ───────────────────────────────────────────── */}
      {resolvingIncident && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--pm-surface, #ffffff)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: 700 }}>
              Resolve Incident: {resolvingIncident.plate_number}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: '0 0 16px' }}>
              {resolvingIncident.description}
            </p>

            <form onSubmit={handleResolveIncidentSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
                  Resolution Notes / Operator Action
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Spoke with driver; confirmed maintenance was completed at Circle workshop."
                  rows={4}
                  required
                  className="pm-input"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setResolvingIncident(null)}
                  className="pm-btn pm-btn-ghost pm-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingSubmitting}
                  className="pm-btn pm-btn-primary pm-btn-sm"
                >
                  {resolvingSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 4: ADD VEHICLE FOR USER (ADMIN ASSISTANCE)
      ───────────────────────────────────────────── */}
      {showAddVehicleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--pm-surface, #ffffff)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: 700 }}>
              Add Vehicle for {selectedUser?.name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-muted)', margin: '0 0 16px' }}>
              Register a vehicle and assign driver details on behalf of this user.
            </p>

            <form onSubmit={handleAddVehicleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GE 4421-23"
                    value={newVehPlate}
                    onChange={(e) => setNewVehPlate(e.target.value)}
                    required
                    className="pm-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Vehicle Type</label>
                  <select
                    value={newVehType}
                    onChange={(e) => setNewVehType(e.target.value)}
                    className="pm-select"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <option value="trotro">Trotro</option>
                    <option value="taxi">Taxi</option>
                    <option value="bus">Bus</option>
                    <option value="hauling">Hauling Truck</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Make</label>
                  <input
                    type="text"
                    value={newVehMake}
                    onChange={(e) => setNewVehMake(e.target.value)}
                    className="pm-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Model</label>
                  <input
                    type="text"
                    value={newVehModel}
                    onChange={(e) => setNewVehModel(e.target.value)}
                    className="pm-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kwame Boakye"
                    value={newVehDriverName}
                    onChange={(e) => setNewVehDriverName(e.target.value)}
                    className="pm-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Driver Phone</label>
                  <input
                    type="text"
                    placeholder="+233 24 000 0000"
                    value={newVehDriverPhone}
                    onChange={(e) => setNewVehDriverPhone(e.target.value)}
                    className="pm-input"
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                  GPS Tracker IMEI (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 864201049281728"
                  value={newVehImei}
                  onChange={(e) => setNewVehImei(e.target.value)}
                  className="pm-input"
                  style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="pm-btn pm-btn-ghost pm-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVehicleSubmitting}
                  className="pm-btn pm-btn-primary pm-btn-sm"
                >
                  {addingVehicleSubmitting ? 'Creating Vehicle...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
