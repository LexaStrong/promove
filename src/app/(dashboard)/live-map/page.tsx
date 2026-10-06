'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Navigation,
  ArrowLeft,
  MapPin,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Clock,
  Maximize2,
  Minimize2,
  ExternalLink,
  Target,
  Search,
  X,
  Phone,
  Route,
  ChevronUp,
} from 'lucide-react';
import { GpsPosition, VehicleGpsStatus, VehicleCondition, GpsAlert } from '@/lib/gps/traccar-adapter';
import { fleetPositions } from '@/lib/gps/fleet-positions';
import { mockDrivers } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { useFleet } from '@/lib/fleet-context';
import type { VehicleMarkerData } from '@/components/map/tracking-map';

// Dynamically import Leaflet Map to ensure SSR compatibility in Next.js
const TrackingMap = dynamic(() => import('@/components/map/tracking-map'), {
  ssr: false,
  loading: () => (
    <div
      id="divMap"
      style={{
        height: '427px',
        position: 'relative',
        outlineStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F2633',
        color: '#A1D0E0',
        borderRadius: 'var(--pm-radius-lg)',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 14,
            height: 14,
            border: '2px solid #3A96B5',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span>Initializing Leaflet GPS Tracking Map...</span>
      </div>
    </div>
  ),
});

const mockSafetyAlerts: GpsAlert[] = [
  {
    id: 'alt-1',
    orgId: 'org-001',
    vehicleId: 'veh-2',
    plateNumber: 'GT 1892-23',
    alertType: 'overspeed',
    severity: 'high',
    message: 'Speed alert: Travelling at 68 km/h on Mallam approach (Limit: 50 km/h)',
    location: 'Mallam Junction, Winneba Rd',
    timestamp: '3m ago',
    acknowledged: false,
  },
  {
    id: 'alt-2',
    orgId: 'org-001',
    vehicleId: 'veh-4',
    plateNumber: 'GW 3312-22',
    alertType: 'long_idle',
    severity: 'medium',
    message: 'Stationary idle warning: Ignition on for 34 minutes at passenger queue',
    location: 'Madina Zongo Junction',
    timestamp: '14m ago',
    acknowledged: false,
  },
];

function getPositionAgeMinutes(timestamp: string) {
  const relativeTime = timestamp.match(/^(\d+)m ago$/i);
  if (relativeTime) return Number(relativeTime[1]);
  if (/^(live now|just now)$/i.test(timestamp)) return 0;

  const timestampMs = Date.parse(timestamp);
  return Number.isNaN(timestampMs) ? 0 : Math.max(0, (Date.now() - timestampMs) / 60000);
}

function isPositionStale(position: GpsPosition) {
  return position.status === 'offline' || getPositionAgeMinutes(position.timestamp) >= 15;
}

export function getVehicleCondition(position: GpsPosition): VehicleCondition {
  if (position.condition) return position.condition;
  if (position.status === 'offline' || isPositionStale(position)) return 'offline';
  if (position.status === 'idle') return 'idle';
  if (position.status === 'parked') return 'parked';
  return 'parked';
}

export default function LiveMapPage() {
  const router = useRouter();
  const { org, role } = useAuth();
  const { isDemo, orgName, drivers: fleetDrivers, vehicles: ownedVehicles } = useFleet();
  // Identifiers of the signed-in user's own vehicles; live telemetry is limited to these outside demo mode
  const ownedIdsRef = useRef<{ isDemo: boolean; ids: Set<string> }>({ isDemo, ids: new Set() });
  ownedIdsRef.current = {
    isDemo,
    ids: new Set(
      ownedVehicles.flatMap(v => [v.id, v.plate_number, v.gps_device_id].filter((x): x is string => Boolean(x)))
    ),
  };
  const isOwner = role === 'owner';
  const positionCacheKey = `promove-live-map:${isDemo ? 'demo' : (org?.id ?? 'clean')}`;
  const [vehicles, setVehicles] = useState<GpsPosition[]>(isDemo ? fleetPositions : []);
  const [loadedCacheKey, setLoadedCacheKey] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<GpsPosition | null>(
    isDemo && fleetPositions.length > 0 ? fleetPositions[0] : null
  );
  const [conditionFilter, setConditionFilter] = useState<VehicleCondition | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetSnap, setSheetSnap] = useState<'peek' | 'half' | 'full'>('peek');
  const [isFollowing, setIsFollowing] = useState(false);
  const [locateRequest, setLocateRequest] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const sheetPointerStart = useRef<number | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [alerts, setAlerts] = useState<GpsAlert[]>(isDemo ? mockSafetyAlerts : []);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const sheetSwiped = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const cachedValue: unknown = JSON.parse(localStorage.getItem(positionCacheKey) ?? 'null');
        const cache = cachedValue && typeof cachedValue === 'object' ? cachedValue as {
          savedAt?: unknown;
          positions?: unknown;
        } : null;
        const cachedPositions = Array.isArray(cachedValue) ? cachedValue : cache?.positions;
        const cacheAgeMinutes = typeof cache?.savedAt === 'string'
          ? Math.max(0, (Date.now() - Date.parse(cache.savedAt)) / 60000)
          : 0;
        if (
          Array.isArray(cachedPositions)
          && cachedPositions.every(position =>
            position
            && typeof position.vehicleId === 'string'
            && typeof position.latitude === 'number'
            && typeof position.longitude === 'number'
          )
        ) {
          const positions = (cachedPositions as GpsPosition[]).map(position => cacheAgeMinutes >= 15
            ? {
                ...position,
                status: 'offline' as const,
                timestamp: new Date(Date.now() - Math.max(cacheAgeMinutes, 15) * 60000).toISOString(),
              }
            : position);
          if (positions.length > 0) {
            setVehicles(positions);
            setSelectedVehicle(current => (current ? positions.find(position => position.vehicleId === current.vehicleId) : null) ?? positions[0]);
          }
        }
      } catch {
        // Cached data is optional; the bundled snapshot remains available.
      }
      setLoadedCacheKey(positionCacheKey);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [positionCacheKey]);

  useEffect(() => {
    if (loadedCacheKey !== positionCacheKey) return;
    try {
      localStorage.setItem(positionCacheKey, JSON.stringify({
        savedAt: new Date().toISOString(),
        positions: vehicles,
      }));
    } catch {
      // Storage can be unavailable or full; map rendering remains usable.
    }
  }, [loadedCacheKey, positionCacheKey, vehicles]);

  // Real-time telematics polling from TelemetryHub (Traccar hardware & In-App GPS)
  useEffect(() => {
    let isMounted = true;

    const fetchLivePositions = async () => {
      try {
        const res = await fetch('/api/gps/positions');
        if (!res.ok) return;
        const data = await res.json();
        const { isDemo: demoMode, ids } = ownedIdsRef.current;
        if (data && Array.isArray(data.positions) && !demoMode) {
          data.positions = data.positions.filter((p: GpsPosition) =>
            ids.has(p.vehicleId) || ids.has(p.plateNumber) || (p.imei ? ids.has(p.imei) : false)
          );
          const kept = new Set((data.positions as GpsPosition[]).map(p => p.vehicleId));
          data.alerts = Array.isArray(data.alerts)
            ? data.alerts.filter((a: GpsAlert) => kept.has(a.vehicleId))
            : [];
        }
        if (isMounted && data?.positions && Array.isArray(data.positions) && data.positions.length > 0) {
          setVehicles(prev => {
            const updatedMap = new Map<string, GpsPosition>();
            for (const p of prev) updatedMap.set(p.vehicleId, p);
            for (const p of data.positions) updatedMap.set(p.vehicleId, p);
            return Array.from(updatedMap.values());
          });

          if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
            setAlerts(prev => {
              const existingIds = new Set(prev.map(a => a.id));
              const newAlerts = data.alerts.filter((a: GpsAlert) => !existingIds.has(a.id));
              return [...newAlerts, ...prev].slice(0, 20);
            });
          }
        }
      } catch {
        // Network drop fallback
      }
    };

    fetchLivePositions();
    const interval = setInterval(fetchLivePositions, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Route playback state
  const [isPlaybackOpen, setIsPlaybackOpen] = useState(false);
  const [playbackTimeIndex, setPlaybackTimeIndex] = useState(40);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);

  // Playback timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTimeIndex(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 250 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const filteredVehicles = vehicles.filter(v => {
    // When role is owner, strictly show only vehicles belonging to current owner
    if (isOwner && v.orgId !== (org?.id ?? 'org-001')) {
      return false;
    }
    const cond = getVehicleCondition(v);
    const matchesCondition = conditionFilter === 'all' || cond === conditionFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || `${v.plateNumber} ${v.driverName ?? ''}`.toLowerCase().includes(query);
    return matchesCondition && matchesSearch;
  });

  const parkedCount = vehicles.filter(v => getVehicleCondition(v) === 'parked').length;
  const offlineCount = vehicles.filter(v => getVehicleCondition(v) === 'offline').length;
  const alertCount = vehicles.filter(v => getVehicleCondition(v) === 'alert').length;
  const idleCount = vehicles.filter(v => getVehicleCondition(v) === 'idle').length;
  const maintenanceCount = vehicles.filter(v => getVehicleCondition(v) === 'maintenance').length;

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const handleSelectVehicle = useCallback((vehicle: GpsPosition) => {
    setSelectedVehicle(vehicle);
    setFocusRequest(request => request + 1);
  }, []);

  const handleMapVehicleSelect = useCallback((marker: VehicleMarkerData) => {
    const matchingVehicle = vehicles.find(
      vehicle => vehicle.id === marker.id
        || vehicle.vehicleId === marker.vehicleId
        || vehicle.plateNumber === marker.plateNumber
    );
    if (matchingVehicle) handleSelectVehicle(matchingVehicle);
  }, [handleSelectVehicle, vehicles]);

  const handleSheetPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (sheetPointerStart.current === null) return;
    const movement = event.clientY - sheetPointerStart.current;
    sheetPointerStart.current = null;
    if (Math.abs(movement) < 24) return;
    sheetSwiped.current = true;
    setSheetSnap(current => {
      if (movement < 0) return current === 'peek' ? 'half' : 'full';
      return current === 'full' ? 'half' : 'peek';
    });
  };

  // Convert fleet positions into marker data format with sizeable condition blips
  const mapMarkerList: VehicleMarkerData[] = vehicles.length === 0 ? [] : (
    isDemo && vehicles[0]?.vehicleId === 'veh-ge3797'
      ? [
          // 1. Featured active vehicle LOC (GE 3797-20  LOC)
          {
            id: 'veh-ge3797-loc',
            vehicleId: 'veh-ge3797',
            plateNumber: 'GE 3797-20',
            label: 'GE 3797-20  LOC',
            driverName: 'Kweku Addo',
            status: vehicles[0].status,
            condition: getVehicleCondition(vehicles[0]),
            speedKmh: vehicles[0].speedKmh,
            courseHeading: 72,
            latitude: 5.6420,
            longitude: -0.0105,
            batteryPercentage: 96,
            ignition: vehicles[0].ignition,
            imei: '864201049281700',
            locationLabel: 'Tema Port & Motorway Transit Corridor',
            timestamp: vehicles[0].timestamp,
            trailCoordinates: vehicles[0].trailCoordinates,
            isStale: isPositionStale(vehicles[0]),
          },
          // 2. Associated TRK point (GE 3797-20 TRK)
          {
            id: 'veh-ge3797-trk',
            vehicleId: 'veh-ge3797',
            plateNumber: 'GE 3797-20',
            label: 'GE 3797-20 TRK',
            driverName: 'Kweku Addo',
            status: vehicles[0].status,
            condition: getVehicleCondition(vehicles[0]),
            speedKmh: 45,
            courseHeading: 68,
            latitude: 5.6315,
            longitude: -0.0240,
            batteryPercentage: 96,
            ignition: true,
            imei: '864201049281700',
            locationLabel: 'Ashaiman Interchange Approach',
            timestamp: vehicles[0].timestamp,
            trailCoordinates: vehicles[0].trailCoordinates,
            isStale: isPositionStale(vehicles[0]),
            isTrk: true,
          },
          // 3. Other fleet vehicles across Greater Accra
          ...vehicles
            .filter(v => v.vehicleId !== 'veh-ge3797')
            .map(v => ({
              id: v.id,
              vehicleId: v.vehicleId,
              plateNumber: v.plateNumber,
              label: `${v.plateNumber}  LOC`,
              driverName: v.driverName,
              status: v.status,
              condition: getVehicleCondition(v),
              speedKmh: v.speedKmh,
              courseHeading: v.courseHeading,
              latitude: v.latitude,
              longitude: v.longitude,
              batteryPercentage: v.batteryPercentage,
              ignition: v.ignition,
              imei: v.imei,
              locationLabel: v.locationLabel,
              timestamp: v.timestamp,
              trailCoordinates: v.trailCoordinates,
              isStale: isPositionStale(v),
            })),
        ]
      : vehicles.map(v => ({
          id: v.id,
          vehicleId: v.vehicleId,
          plateNumber: v.plateNumber,
          label: `${v.plateNumber}  LOC`,
          driverName: v.driverName,
          status: v.status,
          condition: getVehicleCondition(v),
          speedKmh: v.speedKmh,
          courseHeading: v.courseHeading,
          latitude: v.latitude,
          longitude: v.longitude,
          batteryPercentage: v.batteryPercentage,
          ignition: v.ignition,
          imei: v.imei,
          locationLabel: v.locationLabel,
          timestamp: v.timestamp,
          trailCoordinates: v.trailCoordinates,
          isStale: isPositionStale(v),
        }))
  );

  // Navigate to vehicle dedicated page on click (or show sheet on mobile for owner)
  const handleOpenVehiclePage = (vehicleId: string) => {
    if (isOwner && typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSheetSnap('full');
      return;
    }
    router.push(`/vehicles/${vehicleId}`);
  };

  const selectedDriverPhone = selectedVehicle
    ? ((fleetDrivers.length > 0 ? fleetDrivers : mockDrivers).find(
        driver => driver.full_name === selectedVehicle.driverName
      )?.phone)
    : undefined;

  return (
    <div className="pm-live-map-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 'var(--pm-space-3)' }}>
      {/* Page Header */}
      <div className="pm-page-header pm-live-map-page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="pm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Navigation size={22} color="var(--pm-blue-600)" /> Live GPS Fleet Map
            {isOwner && (
              <span className="pm-badge pm-badge-info" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Owner Fleet: {orgName || org?.name || 'My Fleet'}
              </span>
            )}
          </h1>
          <p className="pm-page-subtitle">
            {isOwner
              ? 'Real-time GPS telematics tracking for your registered fleet vehicles across Ghana corridors'
              : 'Leaflet telematics engine, real-time vehicle coordinates, and dedicated vehicle page navigation'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--pm-space-2)', flexWrap: 'wrap' }}>
          <button
            className={`pm-btn pm-btn-sm ${showTrail ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
            onClick={() => setShowTrail(!showTrail)}
          >
            <Compass size={14} /> Trails {showTrail ? 'On' : 'Off'}
          </button>
          <button
            className={`pm-btn pm-btn-sm ${showGeofences ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
            onClick={() => setShowGeofences(!showGeofences)}
          >
            <Shield size={14} /> Geofences {showGeofences ? 'On' : 'Off'}
          </button>
          <button
            className="pm-btn pm-btn-secondary pm-btn-sm"
            onClick={() => setIsPlaybackOpen(true)}
          >
            <Clock size={14} /> Route Playback
          </button>
          <button
            className={`pm-btn pm-btn-sm ${isMapExpanded ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            title={isMapExpanded ? 'Collapse Map View' : 'Expand Map Fullscreen'}
          >
            {isMapExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isMapExpanded ? 'Collapse View' : 'Expand Map'}</span>
          </button>
          <button
            type="button"
            className="pm-btn pm-btn-sm pm-btn-secondary pm-desktop-panel-toggle"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            aria-label={isPanelCollapsed ? 'Show vehicle list' : 'Hide vehicle list'}
          >
            {isPanelCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            <span>{isPanelCollapsed ? 'Show List' : 'Hide List'}</span>
          </button>
        </div>
      </div>

      <section className="pm-live-map-mobile-controls" aria-label="Search and filter vehicles">
        <label className="pm-live-map-search">
          <Link href="/dashboard" className="pm-live-map-back" aria-label="Back to dashboard">
            <ArrowLeft size={19} />
          </Link>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search plate or driver"
            aria-label="Search by plate or driver"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </label>
        <div className="pm-live-map-status-chips" role="group" aria-label="Filter vehicles by condition">
          {[
            { key: 'parked', label: 'Parked', count: parkedCount, icon: '/pins/parked.png' },
            { key: 'idle', label: 'Idle', count: idleCount, icon: '/pins/idle.png' },
            { key: 'alert', label: 'Alert', count: alertCount, icon: '/pins/alert.png' },
            { key: 'maintenance', label: 'Maintenance', count: maintenanceCount, icon: '/pins/maintenance.png' },
            { key: 'offline', label: 'Offline', count: offlineCount, icon: '/pins/offline.png' },
          ].map(chip => (
            <button
              key={chip.key}
              type="button"
              className={`pm-live-map-status-chip condition-${chip.key} ${conditionFilter === chip.key ? 'active' : ''}`}
              aria-pressed={conditionFilter === chip.key}
              onClick={() => setConditionFilter(conditionFilter === chip.key ? 'all' : chip.key as VehicleCondition)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chip.icon} alt="" style={{ width: 14, height: 17, objectFit: 'contain' }} />
              <span>{chip.label}</span>
              <strong>{chip.count}</strong>
            </button>
          ))}
        </div>
        <div className="pm-live-map-mobile-summary" aria-live="polite">
          <div className="pm-live-map-summary-pill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pins/parked.png" alt="" style={{ width: 12, height: 14, objectFit: 'contain' }} />
            <span>{parkedCount} Parked</span>
          </div>
          <div className="pm-live-map-summary-pill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pins/idle.png" alt="" style={{ width: 12, height: 14, objectFit: 'contain' }} />
            <span>{idleCount} Idle</span>
          </div>
          <div className="pm-live-map-summary-pill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pins/alert.png" alt="" style={{ width: 12, height: 14, objectFit: 'contain' }} />
            <span>{alertCount} Alert</span>
          </div>
          <div className="pm-live-map-summary-pill pm-live-map-summary-strong">
            <span>{selectedVehicle?.plateNumber || 'No GPS active'}</span>
          </div>
        </div>
      </section>

      {/* Main Map View Container */}
      <div
        className="pm-live-map-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: isMapExpanded || isPanelCollapsed ? '1fr' : '320px 1fr',
          gap: 'var(--pm-space-4)',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Side: Vehicle List & Telematics Safety Alerts (hidden if map is expanded) */}
        {!isMapExpanded && !isPanelCollapsed && (
          <div
            className="pm-live-map-desktop-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--pm-space-3)',
              maxHeight: '750px',
              overflowY: 'auto',
            }}
          >
            {/* Quick Filter Bar */}
            <div className="pm-card" style={{ padding: 'var(--pm-space-3)' }}>
              <label className="pm-live-map-desktop-search">
                <Search size={15} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Plate or driver"
                  aria-label="Search vehicles by plate or driver"
                />
              </label>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--pm-text-secondary)',
                  marginBottom: 6,
                }}
              >
                Fleet Telematics Status
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'all' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter('all')}
                >
                  All ({vehicles.length})
                </button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'parked' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter(conditionFilter === 'parked' ? 'all' : 'parked')}
                >
                  Parked ({parkedCount})
                </button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'idle' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter(conditionFilter === 'idle' ? 'all' : 'idle')}
                >
                  Idle ({idleCount})
                </button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'alert' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter(conditionFilter === 'alert' ? 'all' : 'alert')}
                >
                  Alert ({alertCount})
                </button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'maintenance' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter(conditionFilter === 'maintenance' ? 'all' : 'maintenance')}
                >
                  Maint. ({maintenanceCount})
                </button>
                <button
                  type="button"
                  className={`pm-btn pm-btn-xs ${conditionFilter === 'offline' ? 'pm-btn-primary' : 'pm-btn-ghost'}`}
                  onClick={() => setConditionFilter(conditionFilter === 'offline' ? 'all' : 'offline')}
                >
                  Offline ({offlineCount})
                </button>
              </div>
            </div>

            {/* Vehicle List */}
            <div className="pm-card" style={{ flex: 1, overflowY: 'auto', padding: 'var(--pm-space-2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredVehicles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--pm-space-6)', color: 'var(--pm-text-secondary)' }}>
                    <MapPin size={24} style={{ opacity: 0.3, marginBottom: 6 }} />
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>No GPS vehicles found</div>
                    <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Add a vehicle or connect GPS telematics to track live movements.</div>
                  </div>
                ) : (
                  filteredVehicles.map(veh => {
                    const isSelected = selectedVehicle && (selectedVehicle.id === veh.id || selectedVehicle.vehicleId === veh.vehicleId);
                    const cond = getVehicleCondition(veh);
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        key={veh.id}
                      className="pm-map-vehicle-row"
                      onClick={() => handleSelectVehicle(veh)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelectVehicle(veh);
                        }
                      }}
                      style={{
                        padding: 'var(--pm-space-3)',
                        borderRadius: 'var(--pm-radius-md)',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--pm-blue-600)' : '1px solid var(--pm-border)',
                        background: isSelected ? 'var(--pm-blue-50)' : 'var(--pm-surface)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/pins/${cond}.png`}
                            alt={cond}
                            style={{ width: 18, height: 22, objectFit: 'contain' }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--pm-text)' }}>
                            {veh.plateNumber}
                          </span>
                        </div>
                        <span
                          className={`pm-badge pm-badge-${
                            cond === 'alert'
                              ? 'critical'
                              : cond === 'maintenance'
                              ? 'pending'
                              : cond === 'parked'
                              ? 'resolved'
                              : cond === 'idle'
                              ? 'warning'
                              : 'neutral'
                          }`}
                          style={{ textTransform: 'capitalize', fontSize: '0.6875rem' }}
                        >
                          {cond}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                        Driver: {veh.driverName || 'Unassigned'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--pm-text-muted)',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <MapPin size={12} /> {veh.locationLabel}
                      </div>

                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="pm-btn pm-btn-xs pm-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenVehiclePage(veh.vehicleId);
                          }}
                          style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>Open Vehicle Page</span>
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Active Safety Alerts Drawer */}
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <div
                className="pm-card"
                style={{
                  padding: 'var(--pm-space-3)',
                  background: 'var(--pm-error-light)',
                  border: '1px solid var(--pm-error)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'var(--pm-error)',
                    marginBottom: 6,
                  }}
                >
                  <AlertTriangle size={16} /> Telematics Safety Alerts
                </div>
                {alerts
                  .filter(a => !a.acknowledged)
                  .map(alt => (
                    <div
                      key={alt.id}
                      style={{
                        fontSize: '0.75rem',
                        marginBottom: 6,
                        paddingBottom: 6,
                        borderBottom: '1px solid rgba(196,67,67,0.2)',
                      }}
                    >
                      <div>
                        <strong>{alt.plateNumber}:</strong> {alt.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ color: 'var(--pm-text-muted)', fontSize: '0.6875rem' }}>
                          {alt.timestamp}
                        </span>
                        <button
                          type="button"
                          className="pm-btn pm-btn-xs pm-btn-ghost"
                          onClick={() => handleAcknowledgeAlert(alt.id)}
                          style={{ padding: '0 4px', fontSize: '0.6875rem' }}
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Right Side: Leaflet Map Implementation with id="divMap" and Oversee Markers */}
        <div
          className="pm-live-map-canvas"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--pm-space-3)',
            height: isMapExpanded ? 'calc(100vh - 140px)' : 'auto',
          }}
        >
          {/* Leaflet Map Component with id="divMap" */}
          <div
            className="pm-live-map-frame"
            style={{
              position: 'relative',
              borderRadius: 'var(--pm-radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--pm-border)',
              background: '#0F2633',
              flex: 1,
              minHeight: isMapExpanded ? '550px' : '427px',
            }}
          >
            <TrackingMap
              vehicles={mapMarkerList}
              selectedVehicleId={selectedVehicle?.vehicleId || ''}
              onSelectVehicle={handleMapVehicleSelect}
              showTrail={showTrail}
              showGeofences={showGeofences}
              mapHeight={isMapExpanded ? '100%' : '427px'}
              isPlaybackPlaying={isPlaying}
              playbackProgress={playbackTimeIndex}
              isExpanded={isMapExpanded}
              onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
              isFollowing={isFollowing}
              locateRequest={locateRequest}
              focusRequest={focusRequest}
              onLocationRequest={() => setLocateRequest(request => request + 1)}
            />
          </div>

          {/* Selected Vehicle Floating Detail Panel */}
          {selectedVehicle && !isMapExpanded && (
            <div
              className="pm-card pm-live-map-desktop-detail"
              style={{
                padding: 'var(--pm-space-4)',
                background: 'var(--pm-surface)',
                border: '1px solid var(--pm-border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--pm-text)' }}>
                      {selectedVehicle.plateNumber}
                    </span>
                    <span
                      className={`pm-badge ${
                        selectedVehicle.status === 'moving'
                          ? 'pm-badge-success'
                          : selectedVehicle.status === 'idle'
                          ? 'pm-badge-pending'
                          : 'pm-badge-neutral'
                      }`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {selectedVehicle.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pm-text-secondary)', marginTop: 2 }}>
                    Assigned Driver: <strong>{selectedVehicle.driverName || 'Kwame Mensah'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pm-blue-600)' }}>
                    {selectedVehicle.speedKmh}{' '}
                    <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--pm-text-muted)' }}>
                    Battery: {selectedVehicle.batteryPercentage}% | Ignition:{' '}
                    {selectedVehicle.ignition ? 'ON' : 'OFF'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  background: 'var(--pm-bg-muted)',
                  borderRadius: 'var(--pm-radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--pm-text)',
                  marginBottom: 10,
                }}
              >
                <MapPin size={16} color="var(--pm-blue-600)" style={{ flexShrink: 0 }} />
                <span>{selectedVehicle.locationLabel}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--pm-text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  IMEI: {selectedVehicle.imei} | Lat: {selectedVehicle.latitude.toFixed(4)}, Lng:{' '}
                  {selectedVehicle.longitude.toFixed(4)}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="pm-btn pm-btn-secondary pm-btn-sm"
                    onClick={() => setIsPlaybackOpen(true)}
                  >
                    <Clock size={14} /> Review Trip Playback
                  </button>
                  <Link
                    href={`/vehicles/${selectedVehicle.vehicleId || selectedVehicle.id}`}
                    className="pm-btn pm-btn-primary pm-btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Open Dedicated Vehicle Page</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className={`pm-live-map-sheet snap-${sheetSnap}`} aria-label="Vehicle list and details">
        <button
          type="button"
          className="pm-live-map-sheet-handle"
          aria-label={`Vehicle sheet ${sheetSnap} height. Tap or drag to resize.`}
          onPointerDown={event => { sheetPointerStart.current = event.clientY; }}
          onPointerUp={handleSheetPointerUp}
          onPointerCancel={() => { sheetPointerStart.current = null; }}
          onClick={() => {
            if (sheetSwiped.current) {
              sheetSwiped.current = false;
              return;
            }
            setSheetSnap(current => current === 'peek' ? 'half' : current === 'half' ? 'full' : 'peek');
          }}
        >
          <span className="pm-live-map-sheet-grip" />
          <span className="pm-live-map-sheet-hint">Vehicles · {filteredVehicles.length}</span>
          <ChevronUp size={18} aria-hidden="true" />
        </button>

        <div className="pm-live-map-sheet-content">
          {selectedVehicle ? (
            <article className="pm-live-map-selected">
              <div className="pm-live-map-selected-heading">
                <div>
                  <strong>{selectedVehicle.plateNumber}</strong>
                  <span className={`pm-live-map-selected-status status-${isPositionStale(selectedVehicle) ? 'offline' : selectedVehicle.status}`}>
                    {isPositionStale(selectedVehicle) ? 'Offline' : selectedVehicle.status}
                  </span>
                </div>
                <strong className="pm-live-map-speed">{selectedVehicle.speedKmh} <small>km/h</small></strong>
              </div>
              <div className="pm-live-map-selected-meta">
                <span>{selectedVehicle.driverName || 'Unassigned driver'}</span>
                <span>{isPositionStale(selectedVehicle) ? 'Out of date' : selectedVehicle.timestamp}</span>
              </div>
              <div className="pm-live-map-selected-address">
                <MapPin size={15} aria-hidden="true" />
                <span>{selectedVehicle.locationLabel}</span>
              </div>
              <div className="pm-live-map-actions">
                <button type="button" className={isFollowing ? 'active' : ''} onClick={() => setIsFollowing(!isFollowing)}>
                  <Target size={17} /> Follow
                </button>
                <button type="button" className={showTrail ? 'active' : ''} onClick={() => setShowTrail(!showTrail)}>
                  <Route size={17} /> Trail
                </button>
                {selectedDriverPhone ? (
                  <a href={`tel:${selectedDriverPhone}`}>
                    <Phone size={17} /> Call
                  </a>
                ) : (
                  <button type="button" disabled>
                    <Phone size={17} /> Call
                  </button>
                )}
                <Link href={`/incidents?vehicleId=${encodeURIComponent(selectedVehicle.vehicleId)}`}>
                  <AlertTriangle size={17} /> Report
                </Link>
              </div>
            </article>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--pm-space-4)', color: 'var(--pm-text-secondary)', fontSize: '0.8125rem' }}>
              No GPS-tracked vehicle active
            </div>
          )}

          <div className="pm-live-map-sheet-list" aria-label="Vehicles">
            {filteredVehicles.map(vehicle => {
              const cond = getVehicleCondition(vehicle);
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  className={`pm-live-map-list-row ${vehicle.id === selectedVehicle?.id ? 'selected' : ''}`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/pins/${cond}.png`}
                    alt={cond}
                    style={{ width: 20, height: 24, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span className="pm-live-map-list-main">
                    <strong>{vehicle.plateNumber}</strong>
                    <small>{vehicle.driverName || 'Unassigned'} · {vehicle.timestamp}</small>
                  </span>
                  <span
                    className={`pm-badge pm-badge-${
                      cond === 'alert'
                        ? 'critical'
                        : cond === 'maintenance'
                        ? 'pending'
                        : cond === 'parked'
                        ? 'resolved'
                        : cond === 'idle'
                        ? 'warning'
                        : 'neutral'
                    }`}
                    style={{ textTransform: 'capitalize', fontSize: '0.6875rem' }}
                  >
                    {cond}
                  </span>
                </button>
              );
            })}
            {filteredVehicles.length === 0 && <p className="pm-live-map-empty">No vehicles match this search.</p>}
          </div>
        </div>
      </section>

      {/* Historical Route Playback Modal */}
      {isPlaybackOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--pm-space-4)',
          }}
        >
          <div
            style={{
              background: 'var(--pm-bg)',
              borderRadius: 'var(--pm-radius-lg)',
              width: '100%',
              maxWidth: 650,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: 'var(--pm-space-4) var(--pm-space-5)',
                borderBottom: '1px solid var(--pm-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Historical Route Playback: {selectedVehicle?.plateNumber || 'Vehicle'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-muted)' }}>
                  Corridor: Tema Ashaiman to Accra Commercial Hub (Today 06:00 to 18:00)
                </span>
              </div>
              <button
                type="button"
                className="pm-btn pm-btn-ghost"
                onClick={() => {
                  setIsPlaybackOpen(false);
                  setIsPlaying(false);
                }}
                style={{ padding: 4 }}
              >
                Close
              </button>
            </div>

            {/* Playback Controls & Scrubber */}
            <div style={{ padding: 'var(--pm-space-5)' }}>
              <div
                style={{
                  background: 'var(--pm-bg-subtle)',
                  border: '1px solid var(--pm-border)',
                  borderRadius: 'var(--pm-radius-md)',
                  padding: 'var(--pm-space-4)',
                  marginBottom: 'var(--pm-space-4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    fontSize: '0.8125rem',
                  }}
                >
                  <span>
                    Logged Time:{' '}
                    <strong>{`06:${String(Math.floor(playbackTimeIndex * 0.12)).padStart(2, '0')} AM`}</strong>
                  </span>
                  <span>
                    Instantaneous Speed:{' '}
                    <strong>{Math.min(playbackTimeIndex + 15, 75)} km/h</strong>
                  </span>
                  <span>
                    Odometer: <strong>{14280 + Math.floor(playbackTimeIndex * 0.4)} km</strong>
                  </span>
                </div>

                {/* Scrubber slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playbackTimeIndex}
                  onChange={e => setPlaybackTimeIndex(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--pm-blue-600)', cursor: 'pointer' }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                    color: 'var(--pm-text-muted)',
                    marginTop: 4,
                  }}
                >
                  <span>06:00 AM (Ashaiman Interchange)</span>
                  <span>12:00 PM (Corridor Approach)</span>
                  <span>06:00 PM (Tema Port Terminal)</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="pm-btn pm-btn-primary pm-btn-sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    className="pm-btn pm-btn-secondary pm-btn-sm"
                    onClick={() => {
                      setPlaybackTimeIndex(0);
                      setIsPlaying(false);
                    }}
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pm-text-secondary)' }}>Speed:</span>
                  {([1, 2, 5] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`pm-btn pm-btn-xs ${playbackSpeed === s ? 'pm-btn-primary' : 'pm-btn-secondary'}`}
                      onClick={() => setPlaybackSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--pm-space-3) var(--pm-space-5)',
                borderTop: '1px solid var(--pm-border)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                className="pm-btn pm-btn-secondary"
                onClick={() => {
                  setIsPlaybackOpen(false);
                  setIsPlaying(false);
                }}
              >
                Close Playback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
