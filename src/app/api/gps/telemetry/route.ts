import { NextResponse } from 'next/server';
import { telemetryHub } from '@/lib/gps/telemetry-hub';
import {
  isValidLatitude,
  isValidLongitude,
  isValidSpeedKmh,
  sanitizePlateNumber,
  sanitizePlainText,
} from '@/lib/security';

/**
 * In-App High-Accuracy Background GPS Receiver
 * Streams live coordinates from ProMove driver phone / browser into the fleet map
 * Validates all inputs to block injection and corrupt spatial data
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      vehicleId,
      plateNumber,
      driverName,
      latitude,
      longitude,
      altitudeMeters,
      speedKmh,
      courseHeading,
      batteryPercentage,
      ignition,
    } = body;

    // Strict Input Validation
    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return NextResponse.json(
        { error: 'Invalid geographic coordinates. Latitude must be [-90, 90], Longitude must be [-180, 180].' },
        { status: 400 }
      );
    }

    const cleanLat = Number(latitude);
    const cleanLng = Number(longitude);
    const cleanSpeed = isValidSpeedKmh(speedKmh) ? Number(speedKmh) : 0;
    const cleanVehicleId = sanitizePlainText(vehicleId, 64) || 'in-app-vehicle';
    const cleanPlate = sanitizePlateNumber(plateNumber) || 'Live Mobile GPS';
    const cleanDriver = sanitizePlainText(driverName, 100) || 'Driver (Mobile PWA)';

    const result = telemetryHub.ingest({
      vehicleId: cleanVehicleId,
      plateNumber: cleanPlate,
      driverName: cleanDriver,
      latitude: cleanLat,
      longitude: cleanLng,
      altitudeMeters: typeof altitudeMeters === 'number' && !isNaN(altitudeMeters) ? Number(altitudeMeters) : undefined,
      speedKmh: cleanSpeed,
      courseHeading: typeof courseHeading === 'number' && !isNaN(courseHeading) ? Number(courseHeading) : undefined,
      batteryPercentage: typeof batteryPercentage === 'number' && batteryPercentage >= 0 && batteryPercentage <= 100 ? Number(batteryPercentage) : undefined,
      ignition: ignition !== undefined ? Boolean(ignition) : cleanSpeed > 0,
      source: 'in_app_sender',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      position: result.position,
      alerts: result.alerts,
    });
  } catch (error: any) {
    console.error('In-app telematics error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process GPS ping.' }, { status: 500 });
  }
}
