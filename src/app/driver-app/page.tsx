'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Navigation, Radio, Battery, AlertTriangle, ShieldCheck,
  CheckCircle2, Compass, MapPin, Gauge, Pause, Play, ArrowLeft, RefreshCw, Smartphone
} from 'lucide-react';
import { useFleet } from '@/lib/fleet-context';
import { ghanaCorridorGeofences } from '@/lib/gps/telemetry-hub';
import { traccarAdapter } from '@/lib/gps/traccar-adapter';

interface OfflinePing {
  latitude: number;
  longitude: number;
  speedKmh: number;
  courseHeading?: number;
  timestamp: string;
}

export default function DriverAppPage() {
  const { vehicles, drivers, isDemo } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(95);
  const [activeGeofence, setActiveGeofence] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<OfflinePing[]>([]);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const offlineQueueRef = useRef<OfflinePing[]>([]);
  offlineQueueRef.current = offlineQueue;

  // Auto-select first available vehicle
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Battery API detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  // Transmit location ping to ProMove telematics hub
  const sendPing = useCallback(async (lat: number, lng: number, speed: number, heading: number, batt: number) => {
    const payload = {
      vehicleId: selectedVehicle?.id || 'live-mobile',
      plateNumber: selectedVehicle?.plate_number || 'Mobile GPS',
      latitude: lat,
      longitude: lng,
      speedKmh: speed,
      courseHeading: heading,
      batteryPercentage: batt,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/gps/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLastPingTime(new Date().toLocaleTimeString('en-GH'));
        setPingCount(prev => prev + 1);

        // Flush queued offline items if any
        if (offlineQueueRef.current.length > 0) {
          const queueToFlush = [...offlineQueueRef.current];
          setOfflineQueue([]);
          for (const item of queueToFlush) {
            await fetch('/api/gps/telemetry', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payload, ...item }),
            }).catch(() => {});
          }
        }
      } else {
        // Enqueue offline ping
        setOfflineQueue(prev => [...prev.slice(-49), { latitude: lat, longitude: lng, speedKmh: speed, timestamp: new Date().toISOString() }]);
      }
    } catch {
      // Network drop: store in offline queue for corridor dead zones
      setOfflineQueue(prev => [...prev.slice(-49), { latitude: lat, longitude: lng, speedKmh: speed, timestamp: new Date().toISOString() }]);
    }
  }, [selectedVehicle]);

  // Start / Stop High-Accuracy Geolocation Tracker
  const handleToggleBroadcast = () => {
    if (isBroadcasting) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      setCurrentSpeed(0);
    } else {
      // Start high-accuracy tracking
      if (!('geolocation' in navigator)) {
        setGpsError('Geolocation is not supported by this browser.');
        return;
      }

      setGpsError(null);
      setIsBroadcasting(true);

      const id = navigator.geolocation.watchPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const rawSpeed = position.coords.speed; // meters per second
          const speedKmh = rawSpeed !== null && rawSpeed > 0 ? Math.round(rawSpeed * 3.6) : 0;
          const heading = position.coords.heading !== null && !isNaN(position.coords.heading) ? Math.round(position.coords.heading) : 0;
          const acc = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

          setCurrentCoords({ lat, lng });
          setCurrentSpeed(speedKmh);
          setCurrentHeading(heading);
          setAccuracy(acc);

          // Check Ghana corridor geofences
          const gfCheck = traccarAdapter.checkGeofences(lat, lng, ghanaCorridorGeofences);
          const currentGf = gfCheck.find(g => g.isInside);
          setActiveGeofence(currentGf ? currentGf.geofence.name : null);

          // Dispatch ping to server
          sendPing(lat, lng, speedKmh, heading, batteryLevel);
        },
        err => {
          console.warn('Geolocation tracking notice:', err.message);
          setGpsError(err.message || 'Unable to retrieve high-accuracy GPS fix.');
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );

      watchIdRef.current = id;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const isOverspeed = currentSpeed > 80;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #091924 0%, #061118 100%)',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: 40,
    }}>
      {/* Top Header */}
      <header style={{
        padding: '16px 20px',
        borderBottom: '1px solid #133246',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#061118',
      }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#A1D0E0', fontSize: '0.8125rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Exit to Fleet View
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            background: isBroadcasting ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isBroadcasting ? '#22C55E' : '#EF4444',
            padding: '3px 10px',
            borderRadius: 12,
            border: `1px solid ${isBroadcasting ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isBroadcasting ? '#22C55E' : '#EF4444',
              animation: isBroadcasting ? 'pulse 1.5s infinite' : 'none',
            }} />
            {isBroadcasting ? 'GPS BROADCAST ACTIVE' : 'TRACKER STANDBY'}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px' }}>
        {/* Vehicle Selection Card */}
        <div style={{
          background: '#0F2633',
          border: '1px solid #1E475E',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 16,
        }}>
          <label style={{ fontSize: '0.75rem', color: '#6A9BB0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
            Selected Vehicle to Broadcast
          </label>
          <select
            value={selectedVehicleId}
            onChange={e => setSelectedVehicleId(e.target.value)}
            disabled={isBroadcasting}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              background: '#061118',
              color: '#FFFFFF',
              border: '1px solid #1E475E',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.plate_number} • {v.make} {v.model} ({v.vehicle_type})
              </option>
            ))}
          </select>
        </div>

        {/* Big Speedometer & Telematics Gauge */}
        <div style={{
          background: isOverspeed ? 'rgba(220, 38, 38, 0.15)' : '#0F2633',
          border: `2px solid ${isOverspeed ? '#DC2626' : isBroadcasting ? '#0B4F6C' : '#1E475E'}`,
          borderRadius: 20,
          padding: '32px 20px',
          textAlign: 'center',
          marginBottom: 20,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#A1D0E0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>
            Real-Time Ground Speed
          </div>

          <div style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: isOverspeed ? '#EF4444' : '#FFFFFF',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {currentSpeed}
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#6A9BB0', marginLeft: 8 }}>km/h</span>
          </div>

          {isOverspeed && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 20,
              marginTop: 12,
            }}>
              <AlertTriangle size={14} /> SPEED LIMIT EXCEEDED (&gt;80 km/h)
            </div>
          )}

          {/* Telematics Sub-grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid #1E475E',
          }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#6A9BB0' }}>HEADING</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Compass size={14} color="#3A96B5" /> {currentHeading}°
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#6A9BB0' }}>BATTERY</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Battery size={14} color={batteryLevel < 20 ? '#EF4444' : '#22C55E'} /> {batteryLevel}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#6A9BB0' }}>ACCURACY</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 2 }}>
                {accuracy ? `±${accuracy}m` : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Ghana Corridor Geofence Radar Card */}
        <div style={{
          background: '#0F2633',
          border: '1px solid #1E475E',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MapPin size={16} color="#3A96B5" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#A1D0E0' }}>
              Active Transit Geofence Status
            </span>
          </div>

          <div style={{
            background: '#061118',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: activeGeofence ? '#22C55E' : '#6A9BB0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{activeGeofence || 'Transit Route (En Route)'}</span>
            {activeGeofence && (
              <span style={{ fontSize: '0.6875rem', background: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: 10 }}>
                Inside Zone
              </span>
            )}
          </div>

          {currentCoords && (
            <div style={{ fontSize: '0.6875rem', color: '#6A9BB0', fontFamily: 'monospace', marginTop: 8 }}>
              Fix: {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
            </div>
          )}
        </div>

        {/* Error Notice */}
        {gpsError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            padding: '12px',
            borderRadius: 8,
            fontSize: '0.8125rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Big Start / Stop Broadcast Action Button */}
        <button
          type="button"
          onClick={handleToggleBroadcast}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: 14,
            border: 'none',
            background: isBroadcasting ? '#DC2626' : '#0B4F6C',
            color: '#FFFFFF',
            fontSize: '1.125rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: isBroadcasting
              ? '0 0 25px rgba(220, 38, 38, 0.4)'
              : '0 0 25px rgba(11, 79, 108, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          {isBroadcasting ? (
            <>
              <Pause size={22} /> Stop Tracking Shift
            </>
          ) : (
            <>
              <Play size={22} fill="#FFFFFF" /> Start Shift & Broadcast GPS
            </>
          )}
        </button>

        {/* Telemetry Stats & Queue Status */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#6A9BB0',
        }}>
          <div>Pings Sent: <strong style={{ color: '#FFFFFF' }}>{pingCount}</strong></div>
          {lastPingTime && <div>Last Sent: <strong style={{ color: '#FFFFFF' }}>{lastPingTime}</strong></div>}
          {offlineQueue.length > 0 && (
            <div style={{ color: '#F59E0B' }}>
              Offline Queue: <strong>{offlineQueue.length}</strong>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
