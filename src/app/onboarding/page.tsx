'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car, Building2, User, Phone, Plus, Trash2, ArrowRight,
  ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Hash,
  Fuel, Gauge, Calendar, UserCheck, Banknote, Palette,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { writeFleetWorkspace } from '@/lib/fleet-storage';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Vehicle, Driver, VehicleType } from '@/lib/types';
import {
  getCuratedMakes,
  getCuratedModels,
  DEFAULT_VEHICLE_PRESETS,
} from '@/lib/vehicle-catalog';

interface VehicleDraft {
  id: string;
  plate_number: string;
  vehicle_type: 'trotro' | 'taxi' | 'bus' | 'hauling' | 'delivery';
  make: string;
  model: string;
  // Specifications
  year: number;
  seats: number;
  fuel_type: 'diesel' | 'petrol' | 'lpg' | 'electric';
  odometer_km: number;
  colour: string;
  // Current Assignment
  assigned: boolean;
  driver_name: string;
  driver_phone: string;
  daily_target_cedis: number;
}

const VEHICLE_TYPE_CONFIG = {
  trotro: { label: 'Trotro (Minibus)', defaultMake: DEFAULT_VEHICLE_PRESETS.trotro.make, defaultModel: DEFAULT_VEHICLE_PRESETS.trotro.model, seats: 15, year: 2023, fuel_type: 'diesel' as const, colour: 'White', dailyTarget: 350 },
  taxi: { label: 'Taxi (Cab / Saloon)', defaultMake: DEFAULT_VEHICLE_PRESETS.taxi.make, defaultModel: DEFAULT_VEHICLE_PRESETS.taxi.model, seats: 4, year: 2022, fuel_type: 'petrol' as const, colour: 'Yellow / Ash', dailyTarget: 200 },
  bus: { label: 'Intercity Bus / Coach', defaultMake: DEFAULT_VEHICLE_PRESETS.bus.make, defaultModel: DEFAULT_VEHICLE_PRESETS.bus.model, seats: 32, year: 2023, fuel_type: 'diesel' as const, colour: 'White', dailyTarget: 600 },
  hauling: { label: 'Haulage Truck / Tipper', defaultMake: DEFAULT_VEHICLE_PRESETS.hauling.make, defaultModel: DEFAULT_VEHICLE_PRESETS.hauling.model, seats: 3, year: 2022, fuel_type: 'diesel' as const, colour: 'Red / White', dailyTarget: 800 },
  delivery: { label: 'Delivery Van', defaultMake: DEFAULT_VEHICLE_PRESETS.delivery.make, defaultModel: DEFAULT_VEHICLE_PRESETS.delivery.model, seats: 2, year: 2023, fuel_type: 'petrol' as const, colour: 'Silver', dailyTarget: 250 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user: localUser } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useClerkUser();

  const clerkContact = clerkUser?.primaryPhoneNumber?.phoneNumber || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const clerkName = clerkUser?.fullName || clerkUser?.firstName || '';
  const localContact = localUser?.phone || localUser?.email || '';
  const localName = localUser?.full_name || '';

  const activeContact = clerkContact || localContact;
  const activeName = clerkName || localName;
  const activeUserId = clerkUser?.id || localUser?.id || null;

  // Step 1: User & Organisation Details (Reactive prefill from Clerk with local auth fallback)
  const [contact, setContact] = useState(activeContact);
  const [username, setUsername] = useState(activeName);
  const [orgName, setOrgName] = useState('');

  // Step 2: Vehicles (Starts empty for a clean slate)
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([]);

  useEffect(() => {
    if (activeContact && !contact) {
      setContact(activeContact);
    }
    if (activeName && !username) {
      setUsername(activeName);
    }
  }, [activeContact, activeName, contact, username]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Quick-fill sample Ghanaian commercial fleet preset
  const handleQuickFillPreset = () => {
    if (!orgName) {
      setOrgName(clerkName ? `${clerkName}'s Transit Fleet` : 'Accra Fast Transport Services');
    }
    if (!contact) {
      setContact(activeContact || '+233 24 123 4567');
    }
    if (!username) {
      setUsername(activeName || 'Kwame Mensah');
    }
    const sampleVehicles: VehicleDraft[] = [
      {
        id: 'v-preset-1',
        plate_number: 'GN 4812-24',
        vehicle_type: 'trotro',
        make: 'Toyota',
        model: 'Hiace',
        year: 2023,
        seats: 15,
        fuel_type: 'diesel',
        odometer_km: 42300,
        colour: 'White',
        assigned: true,
        driver_name: 'Kwesi Appiah',
        driver_phone: '+233 24 987 6543',
        daily_target_cedis: 350,
      },
      {
        id: 'v-preset-2',
        plate_number: 'GS 7192-23',
        vehicle_type: 'taxi',
        make: 'Hyundai',
        model: 'Elantra',
        year: 2022,
        seats: 4,
        fuel_type: 'petrol',
        odometer_km: 68100,
        colour: 'Yellow / Ash',
        assigned: true,
        driver_name: 'Emmanuel Darko',
        driver_phone: '+233 20 456 7890',
        daily_target_cedis: 200,
      },
    ];
    setVehicles(sampleVehicles);
  };

  // Sync vehicle count input
  const handleVehicleCountChange = (count: number) => {
    const validCount = Math.max(0, Math.min(25, count));
    if (validCount === vehicles.length) return;

    if (validCount > vehicles.length) {
      const added: VehicleDraft[] = [];
      const timestamp = Date.now();
      for (let i = vehicles.length; i < validCount; i++) {
        const typeKeys: (keyof typeof VEHICLE_TYPE_CONFIG)[] = ['trotro', 'taxi', 'hauling', 'bus', 'delivery'];
        const chosenType = typeKeys[i % typeKeys.length];
        const cfg = VEHICLE_TYPE_CONFIG[chosenType];
        added.push({
          id: `v-${timestamp}-${i}`,
          plate_number: '',
          vehicle_type: chosenType,
          make: cfg.defaultMake,
          model: cfg.defaultModel,
          year: cfg.year,
          seats: cfg.seats,
          fuel_type: cfg.fuel_type,
          odometer_km: 0,
          colour: cfg.colour,
          assigned: true,
          driver_name: '',
          driver_phone: '',
          daily_target_cedis: cfg.dailyTarget,
        });
      }
      setVehicles([...vehicles, ...added]);
    } else {
      setVehicles(vehicles.slice(0, validCount));
    }
  };

  const handleVehicleChange = (index: number, field: keyof VehicleDraft, value: unknown) => {
    const updated = [...vehicles];
    if (field === 'vehicle_type') {
      const vType = value as keyof typeof VEHICLE_TYPE_CONFIG;
      const cfg = VEHICLE_TYPE_CONFIG[vType] || VEHICLE_TYPE_CONFIG.trotro;
      updated[index] = {
        ...updated[index],
        vehicle_type: vType,
        make: cfg.defaultMake,
        model: cfg.defaultModel,
        seats: cfg.seats,
        year: cfg.year,
        fuel_type: cfg.fuel_type,
        colour: cfg.colour,
        daily_target_cedis: cfg.dailyTarget,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setVehicles(updated);
  };

  const handleMakeChange = (index: number, newMake: string) => {
    const updated = [...vehicles];
    const current = updated[index];
    if (newMake === 'Other') {
      updated[index] = {
        ...current,
        make: 'Other',
        model: 'Other',
      };
    } else {
      const models = getCuratedModels(newMake, current.vehicle_type);
      updated[index] = {
        ...current,
        make: newMake,
        model: models[0] || '',
      };
    }
    setVehicles(updated);
  };

  const handleAddVehicle = () => {
    const nextIdx = vehicles.length + 1;
    const defaultTrotro = VEHICLE_TYPE_CONFIG.trotro;
    setVehicles([
      ...vehicles,
      {
        id: `v-${Date.now()}-${nextIdx}`,
        plate_number: '',
        vehicle_type: 'trotro',
        make: defaultTrotro.defaultMake,
        model: defaultTrotro.defaultModel,
        year: defaultTrotro.year,
        seats: defaultTrotro.seats,
        fuel_type: defaultTrotro.fuel_type,
        odometer_km: 0,
        colour: defaultTrotro.colour,
        assigned: true,
        driver_name: '',
        driver_phone: '',
        daily_target_cedis: defaultTrotro.dailyTarget,
      },
    ]);
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleSkipToDashboard = () => {
    const cleanPayload = {
      orgName: (orgName.trim() || 'My Fleet'),
      contact: contact.trim(),
      username: username.trim(),
      vehicles: [],
      createdAt: new Date().toISOString(),
    };
    writeFleetWorkspace(activeUserId, cleanPayload, []);
    if (activeUserId) {
      writeFleetWorkspace(null, cleanPayload, []);
    }
    router.push('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    if (!contact.trim()) {
      setError('Please provide a valid contact phone or email.');
      return;
    }
    if (!username.trim()) {
      setError('Please provide your operator username or name.');
      return;
    }
    if (!orgName.trim()) {
      setError('Please provide your organisation or fleet name.');
      return;
    }

    // Filter vehicles with entered plate
    const validVehicles = vehicles.filter(v => v.plate_number.trim().length > 0);
    if (vehicles.length > 0 && validVehicles.length !== vehicles.length) {
      setError('Please provide a valid Ghana DVLA plate number for each added vehicle, or remove the empty vehicle card.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contact.trim(),
          username: username.trim(),
          org_name: orgName.trim(),
          vehicle_count: validVehicles.length,
          vehicles: validVehicles.map(v => ({
            plate_number: v.plate_number.toUpperCase().trim(),
            vehicle_type: v.vehicle_type,
            make: v.make,
            model: v.model,
            year: v.year,
            seats: v.seats,
            fuel_type: v.fuel_type,
            odometer_km: v.odometer_km,
            colour: v.colour,
            driver_name: v.assigned && v.driver_name?.trim() ? v.driver_name.trim() : null,
            driver_phone: v.assigned && v.driver_phone?.trim() ? v.driver_phone.trim() : null,
            daily_target_pesewas: (v.daily_target_cedis || 0) * 100,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize fleet organization.');
      }

      const timestamp = Date.now();
      const createdDrivers: Driver[] = [];
      const createdVehicles: Vehicle[] = validVehicles.map((v, i) => {
        const vehId = `veh-${timestamp}-${i + 1}`;
        let currentDriver: Driver | undefined = undefined;

        if (v.assigned && v.driver_name?.trim()) {
          const drvId = `drv-${timestamp}-${i + 1}`;
          currentDriver = {
            id: drvId,
            org_id: 'org-user',
            user_id: null,
            full_name: v.driver_name.trim(),
            phone: v.driver_phone?.trim() || contact.trim(),
            role_type: 'driver',
            licence_number_enc: null,
            licence_class: 'C',
            licence_expiry: new Date(timestamp + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
            status: 'active',
            emergency_contact: null,
            archived_at: null,
          };
          createdDrivers.push(currentDriver);
        }

        const vTypeMap: Record<VehicleDraft['vehicle_type'], VehicleType> = {
          trotro: 'trotro',
          taxi: 'taxi',
          bus: 'bus',
          hauling: 'truck',
          delivery: 'pickup',
        };

        return {
          id: vehId,
          org_id: 'org-user',
          plate_number: v.plate_number.toUpperCase().trim(),
          vehicle_type: vTypeMap[v.vehicle_type] || 'trotro',
          make: v.make || 'Toyota',
          model: v.model || 'Hiace',
          year: v.year || 2023,
          seats: v.seats || 15,
          fuel_type: v.fuel_type || 'diesel',
          colour: v.colour || 'White',
          vin: null,
          gps_device_id: null,
          odometer_km: v.odometer_km || 0,
          daily_target_pesewas: (v.daily_target_cedis || 350) * 100,
          status: currentDriver ? ('active' as const) : ('idle' as const),
          current_driver: currentDriver,
          archived_at: null,
          created_at: new Date().toISOString(),
        };
      });

      const payload = {
        orgName: orgName.trim(),
        contact: contact.trim(),
        username: username.trim(),
        vehicles: createdVehicles,
        createdAt: new Date().toISOString(),
      };

      // Store in per-user storage (Clerk active user or local user fallback)
      writeFleetWorkspace(activeUserId, payload, createdVehicles, createdDrivers);
      // Also store in fallback un-scoped key so workspace instantly hydrates on dashboard
      if (activeUserId) {
        writeFleetWorkspace(null, payload, createdVehicles, createdDrivers);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving onboarding details.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="pm-onboarding-wrapper">
      {/* Top Header */}
      <header className="pm-onboarding-header">
        <div className="pm-onboarding-header-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/promove-logo-lockup.png"
            alt="ProMove Fleet Control"
            className="pm-onboarding-logo"
          />
          <span className="pm-onboarding-badge-desktop">
            🇬🇭 Onboarding Setup
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <div className="pm-onboarding-step-indicator">
            <span className="pm-onboarding-step-full">
              Step 2 of 2 • Fleet Configuration
            </span>
            <span className="pm-onboarding-step-mobile">
              🇬🇭 Step 2 of 2
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pm-onboarding-main">
        <div className="pm-card pm-onboarding-card">
          <div className="pm-onboarding-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={20} style={{ color: 'var(--pm-blue-600)', flexShrink: 0 }} />
              <h1 className="pm-onboarding-title">
                Set up your fleet workspace
              </h1>
            </div>
            <p className="pm-onboarding-desc">
              Specify your organization details, operator username, and vehicles to immediately unlock telematics, live tracking, and digital ledger control.
            </p>
          </div>

          {/* Clerk SSO Authentication & Fallback Banner */}
          {isClerkLoaded && isClerkSignedIn && clerkUser ? (
            <div style={{
              background: 'var(--pm-blue-50)',
              border: '1px solid var(--pm-blue-200)',
              borderRadius: 'var(--pm-radius-md)',
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} style={{ color: 'var(--pm-blue-700)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pm-blue-900)' }}>
                    Clerk SSO Connected
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pm-blue-700)' }}>
                    Onboarding as <strong>{clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || 'User'}</strong> ({clerkUser.primaryEmailAddress?.emailAddress || clerkUser.id})
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--pm-blue-100)', color: 'var(--pm-blue-800)', padding: '3px 8px', borderRadius: 4 }}>
                CLERK VERIFIED
              </span>
            </div>
          ) : (
            <div style={{
              background: 'var(--pm-bg-subtle)',
              border: '1px solid var(--pm-border-subtle)',
              borderRadius: 'var(--pm-radius-md)',
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCheck size={18} style={{ color: 'var(--pm-text-muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pm-text)' }}>
                    Local Workspace Setup (Clerk Fallback Active)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                    Setting up as a local operator. You can link your Clerk SSO account anytime.
                  </div>
                </div>
              </div>
              <Link
                href="/signup"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--pm-blue-600)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Sign in with Clerk SSO &rarr;
              </Link>
            </div>
          )}

          {/* Quick Starter Preset Action */}
          {vehicles.length === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(11, 79, 108, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1px dashed var(--pm-blue-200)',
              borderRadius: 'var(--pm-radius-md)',
              padding: '10px 14px',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)' }}>
                Want to quickly test onboarding with sample vehicles?
              </span>
              <button
                type="button"
                onClick={handleQuickFillPreset}
                className="pm-btn pm-btn-secondary pm-btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={14} style={{ color: 'var(--pm-blue-600)' }} />
                ⚡ Auto-fill 2 sample vehicles
              </button>
            </div>
          )}

          {error && (
            <div style={{
              background: 'var(--pm-error-light)',
              color: 'var(--pm-error)',
              border: '1px solid var(--pm-error)',
              padding: '12px 16px',
              borderRadius: 'var(--pm-radius-md)',
              fontSize: '0.875rem',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: 'var(--pm-success-light)',
              color: 'var(--pm-success)',
              border: '1px solid var(--pm-success)',
              padding: '16px',
              borderRadius: 'var(--pm-radius-md)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <CheckCircle2 size={20} />
              <span>Fleet successfully registered! Redirecting you to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* 1. Account & Organisation Section */}
            <div className="pm-onboarding-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Building2 size={18} style={{ color: 'var(--pm-blue-600)', flexShrink: 0 }} />
                <h3 className="pm-onboarding-section-title">
                  Organisation & Operator Details
                </h3>
              </div>

              <div className="pm-onboarding-form-grid">
                <div>
                  <label className="pm-form-label">Organisation / Fleet Name *</label>
                  <input
                    type="text"
                    className="pm-input"
                    placeholder="e.g. Accra Urban Express Ltd"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4, display: 'block' }}>
                    Your transport company or venture name
                  </span>
                </div>

                <div>
                  <label className="pm-form-label">Operator Username *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                    }} />
                    <input
                      type="text"
                      className="pm-input"
                      style={{ paddingLeft: 38 }}
                      placeholder="e.g. kwame_asante"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4, display: 'block' }}>
                    Your unique username on ProMove
                  </span>
                </div>

                <div>
                  <label className="pm-form-label">Contact Phone / Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                    }} />
                    <input
                      type="text"
                      className="pm-input"
                      style={{ paddingLeft: 38 }}
                      placeholder="+233 24 412 3456"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)', marginTop: 4, display: 'block' }}>
                    Ghana phone with (+233) or primary email
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Number & Types of Vehicles Section */}
            <div>
              <div className="pm-onboarding-vehicles-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Car size={18} style={{ color: 'var(--pm-blue-600)', flexShrink: 0 }} />
                    <h3 className="pm-onboarding-section-title">
                      Fleet Vehicles & Number Plates
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', margin: '4px 0 0 0' }}>
                    Specify the total number of vehicles, choose their commercial types, and input DVLA registration number plates.
                  </p>
                </div>

                {/* Quick Vehicle Count Stepper */}
                <div className="pm-onboarding-vehicle-count-picker">
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pm-text-secondary)' }}>
                    Total Vehicles:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[1, 2, 3, 5, 10].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleVehicleCountChange(cnt)}
                        style={{
                          background: vehicles.length === cnt ? 'var(--pm-blue-600)' : 'var(--pm-bg-subtle)',
                          color: vehicles.length === cnt ? '#FFFFFF' : 'var(--pm-text)',
                          border: '1px solid var(--pm-border)',
                          borderRadius: 'var(--pm-radius-sm)',
                          padding: '4px 10px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Vehicle Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {vehicles.length === 0 ? (
                  <div style={{
                    border: '2px dashed var(--pm-border)',
                    borderRadius: 'var(--pm-radius-md)',
                    padding: '36px 24px',
                    textAlign: 'center',
                    background: 'var(--pm-surface)',
                  }}>
                    <Car size={36} style={{ color: 'var(--pm-text-muted)', margin: '0 auto 12px' }} />
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9375rem', fontWeight: 600 }}>No vehicles added yet</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', maxWidth: 420, marginInline: 'auto' }}>
                      Add your commercial trotros, buses, or taxis now, or launch your clean workspace and register them later.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddVehicle}
                      className="pm-btn pm-btn-secondary pm-btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={16} />
                      Add Vehicle
                    </button>
                  </div>
                ) : (
                  vehicles.map((v, index) => (
                    <div
                      key={v.id}
                      className="pm-onboarding-vehicle-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            background: 'var(--pm-blue-100)',
                            color: 'var(--pm-blue-700)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 4,
                          }}>
                            Vehicle #{index + 1}
                          </span>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            {VEHICLE_TYPE_CONFIG[v.vehicle_type]?.label || 'Commercial Vehicle'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--pm-error)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* 1. Vehicle Identification */}
                      <div className="pm-onboarding-vehicle-grid">
                        <div>
                          <label className="pm-form-label">Vehicle Type *</label>
                          <select
                            className="pm-input"
                            value={v.vehicle_type}
                            onChange={e => handleVehicleChange(index, 'vehicle_type', e.target.value)}
                          >
                            <option value="trotro">Trotro (15-Seater Minibus)</option>
                            <option value="taxi">Taxi (Cab / Saloon)</option>
                            <option value="bus">Intercity Bus / Coach</option>
                            <option value="hauling">Haulage Truck / Tipper</option>
                            <option value="delivery">Delivery Van</option>
                          </select>
                        </div>

                        <div>
                          <label className="pm-form-label">Ghana DVLA Number Plate *</label>
                          <div style={{ position: 'relative' }}>
                            <Hash size={15} style={{
                              position: 'absolute', left: 12, top: '50%',
                              transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                            }} />
                            <input
                              type="text"
                              className="pm-input"
                              style={{ paddingLeft: 36, letterSpacing: '0.08em', fontWeight: 600 }}
                              placeholder="e.g. GW-2412-23"
                              value={v.plate_number}
                              onChange={e => handleVehicleChange(index, 'plate_number', e.target.value.toUpperCase())}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Vehicle Specifications */}
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--pm-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--pm-text)', marginBottom: 12 }}>
                          <Car size={15} style={{ color: 'var(--pm-blue-600)' }} />
                          Vehicle Specifications
                        </div>

                        <div className="pm-onboarding-vehicle-grid">
                          <div>
                            <label className="pm-form-label">Make *</label>
                            {(() => {
                              const curatedMakes = getCuratedMakes(v.vehicle_type);
                              const isCurated = curatedMakes.includes(v.make);
                              const selectValue = isCurated ? v.make : 'Other';

                              return (
                                <>
                                  <select
                                    className="pm-input"
                                    value={selectValue}
                                    onChange={e => handleMakeChange(index, e.target.value)}
                                  >
                                    {curatedMakes.map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                    <option value="Other">Other / Custom Make...</option>
                                  </select>
                                  {selectValue === 'Other' && (
                                    <input
                                      type="text"
                                      className="pm-input"
                                      style={{ marginTop: 6 }}
                                      placeholder="Enter custom make..."
                                      value={v.make === 'Other' ? '' : v.make}
                                      onChange={e => handleVehicleChange(index, 'make', e.target.value)}
                                      required
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          <div>
                            <label className="pm-form-label">Model *</label>
                            {(() => {
                              const curatedModels = getCuratedModels(v.make, v.vehicle_type);
                              const exactMatch = curatedModels.find(m => m === v.model);
                              const fuzzyMatch = !exactMatch && v.model && v.model !== 'Other'
                                ? curatedModels.find(m => m.toLowerCase().startsWith(v.model.toLowerCase()) || m.toLowerCase().includes(v.model.toLowerCase()))
                                : null;
                              const matchedModel = exactMatch || fuzzyMatch;
                              const selectValue = matchedModel ? matchedModel : 'Other';

                              return (
                                <>
                                  {curatedModels.length > 0 ? (
                                    <select
                                      className="pm-input"
                                      value={selectValue}
                                      onChange={e => {
                                        if (e.target.value === 'Other') {
                                          handleVehicleChange(index, 'model', 'Other');
                                        } else {
                                          handleVehicleChange(index, 'model', e.target.value);
                                        }
                                      }}
                                    >
                                      {curatedModels.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                      <option value="Other">Other / Custom Model...</option>
                                    </select>
                                  ) : null}

                                  {(curatedModels.length === 0 || selectValue === 'Other') && (
                                    <input
                                      type="text"
                                      className="pm-input"
                                      style={{ marginTop: curatedModels.length > 0 ? 6 : 0 }}
                                      placeholder="Enter model name..."
                                      value={v.model === 'Other' ? '' : v.model}
                                      onChange={e => handleVehicleChange(index, 'model', e.target.value)}
                                      required
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          <div>
                            <label className="pm-form-label">Year of Manufacture</label>
                            <input
                              type="number"
                              className="pm-input"
                              placeholder="e.g. 2023"
                              value={v.year || 2023}
                              onChange={e => handleVehicleChange(index, 'year', parseInt(e.target.value, 10) || 2023)}
                            />
                          </div>

                          <div>
                            <label className="pm-form-label">Seating Capacity</label>
                            <input
                              type="number"
                              className="pm-input"
                              placeholder="e.g. 15"
                              value={v.seats || 15}
                              onChange={e => handleVehicleChange(index, 'seats', parseInt(e.target.value, 10) || 1)}
                            />
                          </div>

                          <div>
                            <label className="pm-form-label">Fuel Type</label>
                            <select
                              className="pm-input"
                              value={v.fuel_type || 'diesel'}
                              onChange={e => handleVehicleChange(index, 'fuel_type', e.target.value)}
                            >
                              <option value="diesel">Diesel</option>
                              <option value="petrol">Petrol</option>
                              <option value="lpg">LPG (Gas)</option>
                              <option value="electric">Electric</option>
                            </select>
                          </div>

                          <div>
                            <label className="pm-form-label">Initial Odometer (km)</label>
                            <input
                              type="number"
                              className="pm-input"
                              placeholder="e.g. 0"
                              value={v.odometer_km ?? 0}
                              onChange={e => handleVehicleChange(index, 'odometer_km', parseInt(e.target.value, 10) || 0)}
                            />
                          </div>

                          <div>
                            <label className="pm-form-label">Vehicle Colour</label>
                            <input
                              type="text"
                              className="pm-input"
                              placeholder="e.g. White, Yellow / Ash"
                              value={v.colour || ''}
                              onChange={e => handleVehicleChange(index, 'colour', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Current Assignment */}
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--pm-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--pm-text)' }}>
                            <UserCheck size={15} style={{ color: 'var(--pm-blue-600)' }} />
                            Current Assignment
                          </div>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}>
                            <input
                              type="checkbox"
                              checked={v.assigned}
                              onChange={e => handleVehicleChange(index, 'assigned', e.target.checked)}
                              style={{ width: 15, height: 15, accentColor: 'var(--pm-blue-600)' }}
                            />
                            <span>Assign a driver to this vehicle</span>
                          </label>
                        </div>

                        {v.assigned ? (
                          <div className="pm-onboarding-vehicle-grid">
                            <div>
                              <label className="pm-form-label">Driver Full Name *</label>
                              <div style={{ position: 'relative' }}>
                                <User size={15} style={{
                                  position: 'absolute', left: 12, top: '50%',
                                  transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                                }} />
                                <input
                                  type="text"
                                  className="pm-input"
                                  style={{ paddingLeft: 36 }}
                                  placeholder="e.g. Kofi Mensah"
                                  value={v.driver_name || ''}
                                  onChange={e => handleVehicleChange(index, 'driver_name', e.target.value)}
                                  required={v.assigned}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="pm-form-label">Driver Phone Number</label>
                              <div style={{ position: 'relative' }}>
                                <Phone size={15} style={{
                                  position: 'absolute', left: 12, top: '50%',
                                  transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                                }} />
                                <input
                                  type="tel"
                                  className="pm-input"
                                  style={{ paddingLeft: 36 }}
                                  placeholder="e.g. 024 123 4567"
                                  value={v.driver_phone || ''}
                                  onChange={e => handleVehicleChange(index, 'driver_phone', e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="pm-form-label">Daily Target (GH₵ / day)</label>
                              <div style={{ position: 'relative' }}>
                                <Banknote size={15} style={{
                                  position: 'absolute', left: 12, top: '50%',
                                  transform: 'translateY(-50%)', color: 'var(--pm-text-muted)'
                                }} />
                                <input
                                  type="number"
                                  className="pm-input"
                                  style={{ paddingLeft: 36 }}
                                  placeholder="e.g. 350"
                                  value={v.daily_target_cedis ?? 350}
                                  onChange={e => handleVehicleChange(index, 'daily_target_cedis', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            padding: '10px 14px',
                            background: 'var(--pm-bg-subtle)',
                            borderRadius: 'var(--pm-radius-md)',
                            fontSize: '0.8125rem',
                            color: 'var(--pm-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
                            <span>This vehicle will be registered on <strong>Standby / Unassigned</strong>. You can assign a driver at any time.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Vehicle Button (when vehicles exist) */}
              {vehicles.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="pm-btn pm-btn-secondary"
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.8125rem',
                  }}
                >
                  <Plus size={16} />
                  Add Another Vehicle
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pm-onboarding-footer">
              <div className="pm-onboarding-compliance">
                <ShieldCheck size={16} style={{ color: 'var(--pm-success)', flexShrink: 0 }} />
                <span>Act 843 compliant • Postgres tenant isolated</span>
              </div>

              <div className="pm-onboarding-footer-actions">
                <button
                  type="button"
                  onClick={handleSkipToDashboard}
                  className="pm-btn pm-btn-ghost pm-onboarding-skip-btn"
                  style={{ fontSize: '0.875rem' }}
                >
                  Skip to Clean Dashboard
                </button>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="pm-btn pm-btn-primary pm-btn-lg pm-onboarding-submit-btn"
                >
                  {loading ? 'Configuring Fleet...' : 'Complete Setup & Launch Dashboard'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
