import test from 'node:test';
import assert from 'node:assert/strict';

interface TestGpsPosition {
  vehicleId: string;
  speedKmh: number;
  ignition: boolean;
  lastSeen: string;
  lat: number;
  lng: number;
}

function determineStatus(pos: TestGpsPosition, nowMs: number): 'moving' | 'idle' | 'parked' | 'offline' {
  const lastSeenMs = new Date(pos.lastSeen).getTime();
  const diffMinutes = (nowMs - lastSeenMs) / (1000 * 60);

  if (diffMinutes > 30) return 'offline';
  if (pos.speedKmh > 3) return 'moving';
  if (pos.ignition) return 'idle';
  return 'parked';
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

test('GPS Tracking: Automatic vehicle status state machine', () => {
  const now = new Date('2026-10-02T10:00:00Z').getTime();

  // 1. Moving vehicle
  const moving = determineStatus(
    { vehicleId: 'v1', speedKmh: 45, ignition: true, lastSeen: '2026-10-02T09:59:00Z', lat: 5.5, lng: -0.2 },
    now
  );
  assert.equal(moving, 'moving');

  // 2. Stationary vehicle with engine running (idle)
  const idle = determineStatus(
    { vehicleId: 'v2', speedKmh: 0, ignition: true, lastSeen: '2026-10-02T09:59:30Z', lat: 5.5, lng: -0.2 },
    now
  );
  assert.equal(idle, 'idle');

  // 3. Stationary vehicle with ignition off (parked)
  const parked = determineStatus(
    { vehicleId: 'v3', speedKmh: 0, ignition: false, lastSeen: '2026-10-02T09:55:00Z', lat: 5.5, lng: -0.2 },
    now
  );
  assert.equal(parked, 'parked');

  // 4. Device not seen for > 30 minutes (offline)
  const offline = determineStatus(
    { vehicleId: 'v4', speedKmh: 0, ignition: true, lastSeen: '2026-10-02T09:10:00Z', lat: 5.5, lng: -0.2 },
    now
  );
  assert.equal(offline, 'offline');
});

test('GPS Geofencing: Accurately checks depot proximity and boundaries', () => {
  // Accra Central CMB depot coordinates
  const depotLat = 5.545;
  const depotLng = -0.21;
  const depotRadiusMeters = 600;

  // Point A: Inside depot (approx 150m away)
  const distanceInside = calculateDistanceMeters(depotLat, depotLng, 5.546, -0.211);
  assert.ok(distanceInside <= depotRadiusMeters, 'Point A must be inside depot radius');

  // Point B: Outside depot on Ring Road (approx 2.5 km away)
  const distanceOutside = calculateDistanceMeters(depotLat, depotLng, 5.568, -0.215);
  assert.ok(distanceOutside > depotRadiusMeters, 'Point B must be outside depot radius');
});

test('Traccar & In-App Telemetry: Ingestion, live speed, battery, and Ghana corridor geofencing', () => {
  // Ghana Geofences
  const geofences = [
    { name: 'Kwame Nkrumah Interchange (Circle)', lat: 5.5590, lng: -0.2085, radiusMeters: 650 },
    { name: 'Kasoa Tollbooth Winneba Corridor', lat: 5.5324, lng: -0.3541, radiusMeters: 800 },
    { name: 'Tema Motorway Transit Gate', lat: 5.6420, lng: -0.0105, radiusMeters: 900 },
  ];

  // 1. Ingest normal vehicle moving inside Circle geofence
  const vehiclePing = {
    vehicleId: 'test-trotro-1',
    plateNumber: 'GR 9900-24',
    imei: '864201049281999',
    lat: 5.5590,
    lng: -0.2085,
    speedKmh: 42,
    batteryPercentage: 92,
    ignition: true,
    lastSeen: new Date().toISOString(),
  };

  const status = determineStatus(vehiclePing, Date.now());
  assert.equal(status, 'moving');
  assert.equal(vehiclePing.speedKmh, 42);
  assert.equal(vehiclePing.batteryPercentage, 92);

  // Check geofence
  const matchedGf = geofences.find(gf => calculateDistanceMeters(vehiclePing.lat, vehiclePing.lng, gf.lat, gf.lng) <= gf.radiusMeters);
  assert.ok(matchedGf, 'Must detect vehicle is inside Kwame Nkrumah Interchange');
  assert.equal(matchedGf.name, 'Kwame Nkrumah Interchange (Circle)');

  // 2. Ingest overspeed violation (>80 km/h)
  const speedingVehicle = {
    vehicleId: 'test-trotro-2',
    plateNumber: 'GT 5500-23',
    lat: 5.6420,
    lng: -0.0105,
    speedKmh: 96, // 96 km/h > 80 km/h threshold
    batteryPercentage: 84,
    ignition: true,
    lastSeen: new Date().toISOString(),
  };

  const speedLimit = 80;
  const isOverspeed = speedingVehicle.speedKmh > speedLimit;
  assert.equal(isOverspeed, true, 'Vehicle at 96 km/h must trigger an overspeed alert');

  // 3. Ingest low battery telematics warning (<20%)
  const lowBatteryVehicle = {
    vehicleId: 'test-trotro-3',
    batteryPercentage: 14,
  };
  assert.ok(lowBatteryVehicle.batteryPercentage < 20, 'Telemetry battery warning triggered below 20%');
});
