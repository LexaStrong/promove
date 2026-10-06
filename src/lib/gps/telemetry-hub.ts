// ProMove Central Telematics Hub
// Ingests live telemetry from both hardware Traccar devices and in-app GPS senders
// Evaluates Ghana corridor geofences and safety thresholds

import { GpsPosition, GpsAlert, traccarAdapter, Geofence } from './traccar-adapter';
import { fleetPositions } from './fleet-positions';

// Major Ghana Transit Corridor Geofences
export const ghanaCorridorGeofences: Geofence[] = [
  {
    id: 'gf-circle',
    name: 'Kwame Nkrumah Interchange (Circle Terminal)',
    type: 'depot',
    centerLat: 5.5590,
    centerLng: -0.2085,
    radiusMeters: 650,
    alertOnEnter: true,
    alertOnExit: true,
  },
  {
    id: 'gf-kaneshie',
    name: 'Kaneshie Market Complex & Lorry Station',
    type: 'depot',
    centerLat: 5.5580,
    centerLng: -0.2390,
    radiusMeters: 550,
    alertOnEnter: true,
    alertOnExit: true,
  },
  {
    id: 'gf-madina',
    name: 'Madina Zongo Junction & Lorry Park',
    type: 'depot',
    centerLat: 5.6600,
    centerLng: -0.1650,
    radiusMeters: 600,
    alertOnEnter: true,
    alertOnExit: true,
  },
  {
    id: 'gf-achimota',
    name: 'Achimota Neoplan Terminal',
    type: 'depot',
    centerLat: 5.6120,
    centerLng: -0.1980,
    radiusMeters: 500,
    alertOnEnter: true,
    alertOnExit: true,
  },
  {
    id: 'gf-tema-motorway',
    name: 'Tema Community 1 Central Station & Port Corridor',
    type: 'corridor',
    centerLat: 5.6420,
    centerLng: -0.0105,
    radiusMeters: 900,
    alertOnEnter: false,
    alertOnExit: false,
  },
  {
    id: 'gf-kasoa',
    name: 'Kasoa Tollbooth / Winneba Corridor Transit Gate',
    type: 'corridor',
    centerLat: 5.5324,
    centerLng: -0.3541,
    radiusMeters: 800,
    alertOnEnter: true,
    alertOnExit: true,
  },
  {
    id: 'gf-tetteh-quarshie',
    name: 'Tetteh Quarshie Interchange & Airport Bypass',
    type: 'corridor',
    centerLat: 5.5980,
    centerLng: -0.1750,
    radiusMeters: 700,
    alertOnEnter: false,
    alertOnExit: false,
  },
];

// In-memory telemetry cache (keyed by vehicleId or IMEI)
const livePositionsMap = new Map<string, GpsPosition>();
const liveAlertsList: GpsAlert[] = [];

// Seed with default corridor positions on startup
for (const pos of fleetPositions) {
  livePositionsMap.set(pos.vehicleId, pos);
  if (pos.imei) {
    livePositionsMap.set(pos.imei, pos);
  }
}

export interface IngestTelemetryParams {
  vehicleId?: string;
  plateNumber?: string;
  driverName?: string;
  imei?: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  speedKmh: number;
  courseHeading?: number;
  ignition?: boolean;
  batteryPercentage?: number;
  locationLabel?: string;
  source?: 'traccar_hardware' | 'in_app_sender';
  timestamp?: string;
}

export class TelemetryHub {
  /**
   * Ingest raw GPS telemetry from Traccar hardware webhook or in-app sender
   */
  ingest(params: IngestTelemetryParams): { position: GpsPosition; alerts: GpsAlert[] } {
    const imei = (params.imei || '').trim();
    const vehicleKey = params.vehicleId || imei || 'unknown-device';

    // Look for existing vehicle state or create new
    const existing = livePositionsMap.get(vehicleKey) || (imei ? livePositionsMap.get(imei) : undefined);

    const vehicleId = params.vehicleId || existing?.vehicleId || `veh-${imei.slice(-6) || Date.now()}`;
    const plateNumber = params.plateNumber || existing?.plateNumber || `GH-${imei.slice(-4) || 'GPS'}`;
    const driverName = params.driverName || existing?.driverName || 'Vehicle Driver';
    const now = params.timestamp || new Date().toISOString();

    const speed = Math.max(0, Math.round(params.speedKmh * 10) / 10);
    const ignition = params.ignition !== undefined ? params.ignition : speed > 0;
    const battery = params.batteryPercentage ?? existing?.batteryPercentage ?? 100;
    const course = params.courseHeading ?? existing?.courseHeading ?? 0;
    const altitude = params.altitudeMeters ?? existing?.altitudeMeters ?? 45;

    // 1. Calculate vehicle status via TraccarAdapter
    const status = traccarAdapter.determineStatus({
      speedKmh: speed,
      ignition,
      lastSeenTimestamp: now,
      now,
    });

    // 2. Resolve Ghana Geofence match
    const geofenceResults = traccarAdapter.checkGeofences(
      params.latitude,
      params.longitude,
      ghanaCorridorGeofences
    );
    const activeGeofence = geofenceResults.find(r => r.isInside)?.geofence;
    const locationLabel = params.locationLabel || activeGeofence?.name || existing?.locationLabel || 'Ghana Transit Route';

    // 3. Accumulate breadcrumb trail (up to 20 coordinates)
    const currentCoords: [number, number] = [params.latitude, params.longitude];
    const previousTrail = existing?.trailCoordinates || [];
    const trailCoordinates = [...previousTrail.slice(-19), currentCoords];

    const position: GpsPosition = {
      id: `pos-${vehicleId}`,
      orgId: existing?.orgId || 'org-active',
      vehicleId,
      plateNumber,
      driverName,
      imei: imei || existing?.imei || 'IN-APP-GPS',
      latitude: params.latitude,
      longitude: params.longitude,
      altitudeMeters: altitude,
      speedKmh: speed,
      courseHeading: course,
      ignition,
      batteryPercentage: battery,
      locationLabel,
      status,
      condition: speed > 80 ? 'alert' : status === 'idle' ? 'idle' : status === 'parked' ? 'parked' : undefined,
      timestamp: now,
      trailCoordinates,
    };

    // Store in live map
    livePositionsMap.set(vehicleId, position);
    if (imei) {
      livePositionsMap.set(imei, position);
    }

    // 4. Evaluate Safety Alerts (Overspeeding >80 km/h, Geofence boundaries)
    const alerts = traccarAdapter.evaluateSafetyAlerts(position, 80);

    // Geofence alert
    if (activeGeofence && activeGeofence.alertOnEnter) {
      alerts.push({
        id: `gf_enter_${Date.now()}_${vehicleId}`,
        orgId: position.orgId,
        vehicleId,
        plateNumber,
        alertType: 'geofence_enter',
        severity: 'low',
        message: `${plateNumber} arrived inside ${activeGeofence.name}`,
        location: activeGeofence.name,
        timestamp: now,
        acknowledged: false,
      });
    }

    for (const a of alerts) {
      liveAlertsList.unshift(a);
      if (liveAlertsList.length > 50) {
        liveAlertsList.pop();
      }
    }

    return { position, alerts };
  }

  /**
   * Get all currently tracked positions
   */
  getAllPositions(): GpsPosition[] {
    const seen = new Set<string>();
    const list: GpsPosition[] = [];

    for (const pos of livePositionsMap.values()) {
      if (!seen.has(pos.vehicleId)) {
        seen.add(pos.vehicleId);
        list.push(pos);
      }
    }

    return list;
  }

  /**
   * Get position for a specific vehicle or IMEI
   */
  getPosition(vehicleIdOrImei: string): GpsPosition | undefined {
    return livePositionsMap.get(vehicleIdOrImei);
  }

  /**
   * Get active safety alerts
   */
  getAlerts(): GpsAlert[] {
    return [...liveAlertsList];
  }
}

export const telemetryHub = new TelemetryHub();
