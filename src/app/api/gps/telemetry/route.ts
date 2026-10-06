import { NextResponse } from 'next/server';
import { telemetryHub } from '@/lib/gps/telemetry-hub';

/**
 * In-App High-Accuracy Background GPS Receiver
 * Streams live coordinates from ProMove driver phone / browser into the fleet map
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

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
    }

    const result = telemetryHub.ingest({
      vehicleId: vehicleId || 'in-app-vehicle',
      plateNumber: plateNumber || 'Live Mobile GPS',
      driverName: driverName || 'Driver (Mobile PWA)',
      latitude: Number(latitude),
      longitude: Number(longitude),
      altitudeMeters: altitudeMeters ? Number(altitudeMeters) : undefined,
      speedKmh: Number(speedKmh || 0),
      courseHeading: courseHeading !== null && courseHeading !== undefined ? Number(courseHeading) : undefined,
      batteryPercentage: batteryPercentage ? Number(batteryPercentage) : undefined,
      ignition: ignition !== undefined ? Boolean(ignition) : Number(speedKmh || 0) > 0,
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
