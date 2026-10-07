import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { query } from '@/lib/db';
import { telemetryHub } from '@/lib/gps/telemetry-hub';


export interface AdminVehicleItem {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  seats: number;
  status: 'active' | 'idle' | 'moving' | 'parked' | 'maintenance' | 'unavailable';
  odometer_km: number;
  owner_name: string;
  owner_email: string;
  org_name: string;
  org_id?: string;
  driver_name: string;
  driver_phone: string;
  driver_license: string;
  driver_safety_score?: number;
  gps_tracker_imei: string;
  gps_protocol?: string;
  live_location: {
    latitude: number;
    longitude: number;
    speed_kmh: number;
    course_heading: number;
    ignition: boolean;
    battery_percentage: number;
    location_label: string;
    timestamp: string;
    status: string;
  } | null;
}

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrator session required.' }, { status: 401 });
  }

  try {
    const list: AdminVehicleItem[] = [];
    const seenPlates = new Set<string>();

    // 1. Fetch vehicles with organisation and driver assignments from Neon DB
    let dbVehicles: any[] = [];
    try {
      dbVehicles = await query(`
        SELECT 
          v.id, v.org_id, v.plate_number, v.make, v.model, v.year, 
          v.vehicle_type, v.seats, v.fuel_type, v.current_odometer_km, 
          v.gps_tracker_imei, v.status,
          o.name AS org_name, o.email AS org_email, o.phone AS org_phone,
          d.full_name AS driver_name, d.phone AS driver_phone
        FROM vehicles v
        LEFT JOIN organisations o ON v.org_id = o.id
        LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.is_active = true
        LEFT JOIN drivers d ON va.driver_id = d.id
        WHERE v.status IS NULL OR v.status NOT IN ('archived', 'deleted', 'inactive')
        ORDER BY v.created_at DESC
      `);
    } catch (dbErr) {
      console.warn('Neon DB query notice in admin/vehicles:', dbErr);
    }

    // 2. Fetch live telematics from telemetryHub
    const livePositions = telemetryHub.getAllPositions();

    // Map DB vehicles
    for (const v of dbVehicles) {
      const cleanPlate = (v.plate_number || '').toUpperCase().trim();
      if (!cleanPlate) continue;
      seenPlates.add(cleanPlate);

      // Match live GPS telemetry by IMEI or Plate
      const imei = v.gps_tracker_imei || '';
      let livePos = imei ? telemetryHub.getPosition(imei) : undefined;
      if (!livePos) {
        livePos = livePositions.find(
          p => p.plateNumber.replace(/\s+/g, '').toUpperCase() === cleanPlate.replace(/\s+/g, '').toUpperCase() ||
               (imei && p.imei === imei)
        );
      }
      list.push({
        id: v.id,
        plate_number: cleanPlate,
        make: v.make || 'Toyota',
        model: v.model || 'Hiace',
        year: v.year || 2023,
        vehicle_type: v.vehicle_type || 'trotro',
        fuel_type: v.fuel_type || 'diesel',
        seats: v.seats || 15,
        status: (livePos?.status as any) || v.status || 'parked',
        odometer_km: v.current_odometer_km || 0,
        owner_name: v.org_name || 'Individual Fleet Owner',
        owner_email: v.org_email || '',
        org_name: v.org_name || 'Fleet Operator',
        org_id: v.org_id,
        driver_name: v.driver_name || livePos?.driverName || 'Unassigned',
        driver_phone: v.driver_phone || '',
        driver_license: 'GH-DL-UNASSIGNED',
        driver_safety_score: 95,
        gps_tracker_imei: imei || 'UNASSIGNED',
        gps_protocol: imei ? 'GT06 / Traccar 5055' : 'None',
        live_location: livePos ? {
          latitude: livePos.latitude,
          longitude: livePos.longitude,
          speed_kmh: livePos.speedKmh,
          course_heading: livePos.courseHeading,
          ignition: livePos.ignition,
          battery_percentage: livePos.batteryPercentage,
          location_label: livePos.locationLabel,
          timestamp: livePos.timestamp,
          status: livePos.status,
        } : null,
      });
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      vehicles: list,
    });
  } catch (error: any) {
    console.error('Admin vehicles API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve supervision vehicles.' }, { status: 500 });
  }
}
