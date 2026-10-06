import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { telemetryHub } from '@/lib/gps/telemetry-hub';
import {
  sanitizePlateNumber,
  sanitizePlainText,
  sanitizePhoneNumber,
  isValidImei,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrator session required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      org_id,
      plate_number,
      make = 'Toyota',
      model = 'Hiace',
      year = 2023,
      vehicle_type = 'trotro',
      seats = 15,
      fuel_type = 'diesel',
      driver_name = '',
      driver_phone = '',
      gps_tracker_imei = '',
    } = body;

    const cleanPlate = sanitizePlateNumber(plate_number);
    if (!cleanPlate) {
      return NextResponse.json({ error: 'A valid vehicle registration plate number is required.' }, { status: 400 });
    }

    const cleanImei = String(gps_tracker_imei || '').trim();
    if (cleanImei && !isValidImei(cleanImei)) {
      return NextResponse.json({ error: 'Invalid GPS tracker IMEI format. Must be a 14-16 digit numeric identifier.' }, { status: 400 });
    }

    const cleanMake = sanitizePlainText(make, 32) || 'Toyota';
    const cleanModel = sanitizePlainText(model, 32) || 'Hiace';
    const cleanDriverName = sanitizePlainText(driver_name, 64);
    const cleanDriverPhone = sanitizePhoneNumber(driver_phone);
    const cleanOrgId = sanitizePlainText(org_id, 64);

    // 1. Resolve organization id
    let resolvedOrgId = cleanOrgId;
    if (!resolvedOrgId) {
      const orgs = await query(`SELECT id FROM organisations LIMIT 1`);
      if (orgs.length > 0) {
        resolvedOrgId = orgs[0].id;
      }
    }

    // 2. Insert or update in Neon DB
    let newVehId = `veh-${Date.now()}`;
    try {
      if (resolvedOrgId) {
        const insertRows = await query(
          `INSERT INTO vehicles 
           (org_id, plate_number, make, model, year, vehicle_type, seats, fuel_type, gps_tracker_imei, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
           ON CONFLICT (org_id, plate_number) DO UPDATE
           SET make = EXCLUDED.make, model = EXCLUDED.model, gps_tracker_imei = EXCLUDED.gps_tracker_imei
           RETURNING id`,
          [resolvedOrgId, cleanPlate, cleanMake, cleanModel, year, vehicle_type, seats, fuel_type, cleanImei || null]
        );
        if (insertRows && insertRows.length > 0) {
          newVehId = insertRows[0].id;
        }

        // Add driver if provided
        if (cleanDriverName) {
          const driverRows = await query(
            `INSERT INTO drivers (org_id, full_name, phone, role_type, status)
             VALUES ($1, $2, $3, 'driver', 'active')
             RETURNING id`,
            [resolvedOrgId, cleanDriverName, cleanDriverPhone || '+233 24 000 0000']
          );
          if (driverRows && driverRows.length > 0) {
            await query(
              `INSERT INTO vehicle_assignments (org_id, vehicle_id, driver_id, commission_type, is_active)
               VALUES ($1, $2, $3, 'fixed_daily', true)`,
              [resolvedOrgId, newVehId, driverRows[0].id]
            );
          }
        }
      }
    } catch (dbErr) {
      console.warn('Neon DB vehicle creation notice:', dbErr);
    }

    // 3. Ingest into telemetry hub if IMEI provided
    if (cleanImei) {
      telemetryHub.ingest({
        vehicleId: newVehId,
        plateNumber: cleanPlate,
        driverName: driver_name || 'Assigned Driver',
        imei: cleanImei,
        latitude: 5.5600,
        longitude: -0.2050,
        speedKmh: 0,
        ignition: true,
        batteryPercentage: 100,
        locationLabel: 'Greater Accra Hub',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Vehicle ${cleanPlate} created successfully.`,
      vehicle: {
        id: newVehId,
        plate_number: cleanPlate,
        make,
        model,
        year,
        vehicle_type,
        driver_name,
        gps_tracker_imei: cleanImei,
      },
    });
  } catch (error: any) {
    console.error('Admin create vehicle error:', error);
    return NextResponse.json({ error: 'Failed to create vehicle.' }, { status: 500 });
  }
}
