import { NextResponse } from 'next/server';
import { telemetryHub } from '@/lib/gps/telemetry-hub';
import { query } from '@/lib/db';

/**
 * Traccar GPS Ingestion Webhook
 * Handles incoming telemetry forwarded from Traccar Server (HTTP POST or GET OsmAnd format)
 * Supports hardware trackers (Concox, Teltonika, Coban, Sinotrack)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extract device and position from Traccar Webhook structure
    // Traccar forwards either { device: {...}, position: {...} } or a direct position object
    const device = body.device || {};
    const position = body.position || body;

    const imei = String(device.uniqueId || position.deviceId || body.uniqueId || '').trim();
    if (!imei) {
      return NextResponse.json({ error: 'Missing device IMEI or uniqueId.' }, { status: 400 });
    }

    const latitude = Number(position.latitude);
    const longitude = Number(position.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude.' }, { status: 400 });
    }

    // Traccar speed is in knots (1 knot = 1.852 km/h) unless already converted
    const rawSpeed = Number(position.speed || 0);
    const speedKmh = position.protocol === 'osmand' ? rawSpeed : rawSpeed * 1.852;
    const courseHeading = Number(position.course || 0);
    const altitudeMeters = Number(position.altitude || 0);

    const attributes = position.attributes || {};
    const ignition = attributes.ignition !== undefined ? Boolean(attributes.ignition) : speedKmh > 3;
    const batteryPercentage = attributes.batteryLevel ? Number(attributes.batteryLevel) : attributes.battery ? Number(attributes.battery) : 95;

    // 2. Lookup vehicle plate in DB if available
    let plateNumber = device.name || undefined;
    let vehicleId = undefined;

    try {
      const rows = await query(
        `SELECT id, plate_number, make, model FROM vehicles WHERE gps_device_id = $1 LIMIT 1`,
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
      status: result.position.status,
      speedKmh: result.position.speedKmh,
      location: result.position.locationLabel,
      alertsTriggered: result.alerts.length,
    });
  } catch (error: any) {
    console.error('Traccar webhook ingestion error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse Traccar payload.' },
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
    const imei = searchParams.get('id') || searchParams.get('deviceid') || '';
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');

    if (!imei || isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Missing id, lat, or lon query parameter.' }, { status: 400 });
    }

    const speed = parseFloat(searchParams.get('speed') || '0');
    const course = parseFloat(searchParams.get('bearing') || '0');
    const altitude = parseFloat(searchParams.get('altitude') || '0');
    const batt = parseFloat(searchParams.get('batt') || '95');

    const result = telemetryHub.ingest({
      imei,
      latitude: lat,
      longitude: lon,
      speedKmh: speed * 1.852, // Knots to km/h
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
    return NextResponse.json({ error: error?.message || 'Invalid GET telematics' }, { status: 500 });
  }
}
