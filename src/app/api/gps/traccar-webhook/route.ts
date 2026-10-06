import { NextResponse } from 'next/server';
import { telemetryHub } from '@/lib/gps/telemetry-hub';
import { query } from '@/lib/db';
import { isValidLatitude, isValidLongitude, isValidSpeedKmh, sanitizePlainText } from '@/lib/security';

/**
 * Traccar GPS Ingestion Webhook
 * Handles incoming telemetry forwarded from Traccar Server (HTTP POST or GET OsmAnd format)
 * Supports hardware trackers (Concox, Teltonika, Coban, Sinotrack)
 * Parameterized and sanitized against spatial and text injection
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extract device and position from Traccar Webhook structure
    const device = body.device || {};
    const position = body.position || body;

    const rawImei = String(device.uniqueId || position.deviceId || body.uniqueId || '').trim();
    if (!rawImei) {
      return NextResponse.json({ error: 'Missing device IMEI or uniqueId.' }, { status: 400 });
    }

    const imei = sanitizePlainText(rawImei, 32);
    const latitude = Number(position.latitude);
    const longitude = Number(position.longitude);

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude coordinates.' }, { status: 400 });
    }

    // Traccar speed is in knots (1 knot = 1.852 km/h) unless already converted
    const rawSpeed = Number(position.speed || 0);
    const calculatedSpeed = position.protocol === 'osmand' ? rawSpeed : rawSpeed * 1.852;
    const speedKmh = isValidSpeedKmh(calculatedSpeed) ? calculatedSpeed : 0;
    const courseHeading = Number(position.course || 0);
    const altitudeMeters = Number(position.altitude || 0);

    const attributes = position.attributes || {};
    const ignition = attributes.ignition !== undefined ? Boolean(attributes.ignition) : speedKmh > 3;
    const batteryPercentage = attributes.batteryLevel ? Number(attributes.batteryLevel) : attributes.battery ? Number(attributes.battery) : 95;

    // 2. Parameterized lookup for vehicle in Neon Lakebase DB
    let plateNumber = device.name ? sanitizePlainText(device.name, 20) : undefined;
    let vehicleId = undefined;

    try {
      const rows = await query(
        `SELECT id, plate_number, make, model FROM vehicles WHERE gps_tracker_imei = $1 LIMIT 1`,
        [imei]
      );
      if (rows && rows.length > 0) {
        vehicleId = rows[0].id;
        plateNumber = rows[0].plate_number;
      }
    } catch {
      // Fallback gracefully to in-memory map
    }

    // 3. Ingest into Central Telemetry Hub
    const result = telemetryHub.ingest({
      vehicleId,
      plateNumber,
      imei,
      latitude,
      longitude,
      speedKmh,
      courseHeading,
      altitudeMeters,
      ignition,
      batteryPercentage,
      source: 'traccar_hardware',
      timestamp: position.fixTime || position.deviceTime || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      vehicleId: result.position.vehicleId,
      plateNumber: result.position.plateNumber,
      status: result.position.status,
      speedKmh: result.position.speedKmh,
      alertsTriggered: result.alerts.length,
    });
  } catch (error: any) {
    console.error('Traccar webhook ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to process telematics payload.' },
      { status: 500 }
    );
  }
}

/**
 * Handle OsmAnd / Traccar Client GET protocol (?id=IMEI&lat=...&lon=...&speed=...&bearing=...)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawImei = searchParams.get('id') || searchParams.get('deviceid') || '';
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');

    if (!rawImei || !isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: 'Missing or invalid id, lat, or lon query parameter.' }, { status: 400 });
    }

    const imei = sanitizePlainText(rawImei, 32);
    const rawSpeed = parseFloat(searchParams.get('speed') || '0');
    const speedKmh = isValidSpeedKmh(rawSpeed * 1.852) ? rawSpeed * 1.852 : 0;
    const course = parseFloat(searchParams.get('bearing') || '0');
    const altitude = parseFloat(searchParams.get('altitude') || '0');
    const batt = parseFloat(searchParams.get('batt') || '95');

    const result = telemetryHub.ingest({
      imei,
      latitude: lat,
      longitude: lon,
      speedKmh,
      courseHeading: course,
      altitudeMeters: altitude,
      batteryPercentage: batt,
      source: 'traccar_hardware',
    });

    return NextResponse.json({
      success: true,
      status: result.position.status,
      location: result.position.locationLabel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid GET telematics stream.' }, { status: 500 });
  }
}
