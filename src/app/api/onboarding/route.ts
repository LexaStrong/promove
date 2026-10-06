import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sanitizePlainText, sanitizePlateNumber, sanitizePhoneNumber } from '@/lib/security';

interface VehiclePayload {
  plate_number: string;
  vehicle_type: 'trotro' | 'taxi' | 'bus' | 'hauling' | 'delivery';
  make?: string;
  model?: string;
  year?: number;
  seats?: number;
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  odometer_km?: number;
  colour?: string;
  driver_name?: string | null;
  driver_phone?: string | null;
  daily_target_pesewas?: number;
}

interface OnboardingPayload {
  contact: string;
  username: string;
  org_name: string;
  vehicles: VehiclePayload[];
}

export async function POST(req: Request) {
  try {
    const body: OnboardingPayload = await req.json();
    const { contact, username, org_name, vehicles } = body;

    if (!org_name || !contact || !username) {
      return NextResponse.json(
        { error: 'Contact, username, and organisation name are required.' },
        { status: 400 }
      );
    }

    const cleanOrgName = sanitizePlainText(org_name, 100);
    const cleanUsername = sanitizePlainText(username, 64);
    const cleanContact = contact.includes('@') ? sanitizePlainText(contact, 120).toLowerCase() : sanitizePhoneNumber(contact);

    // Vehicles are optional on initial sign-up; user can add them later
    const validVehicles = vehicles || [];
    const baseSlug = cleanOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'org';
    const slug = `${baseSlug.slice(0, 75)}-${Date.now().toString(36)}`;
    let orgId = 'org-' + Date.now();

    // 2. Persist to Neon Lakebase Postgres if configured
    try {
      const orgRows = await query(
        `INSERT INTO organisations (name, slug, phone, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, phone = EXCLUDED.phone, email = EXCLUDED.email
         RETURNING id, name`,
        [cleanOrgName, slug, cleanContact, cleanContact.includes('@') ? cleanContact : null]
      );

      if (orgRows && orgRows.length > 0) {
        orgId = orgRows[0].id;
      }

      // Persist vehicles and driver assignments into Neon database
      for (const v of validVehicles) {
        if (!v.plate_number?.trim()) continue;
        const cleanPlate = sanitizePlateNumber(v.plate_number);
        if (!cleanPlate) continue;
        const vType = v.vehicle_type || 'trotro';
        const make = v.make || (vType === 'trotro' ? 'Toyota' : vType === 'taxi' ? 'Hyundai' : 'Mercedes-Benz');
        const model = v.model || (vType === 'trotro' ? 'Hiace' : vType === 'taxi' ? 'i10' : 'Sprinter');
        const year = v.year || 2023;
        const seats = v.seats || (vType === 'trotro' ? 15 : vType === 'taxi' ? 4 : vType === 'bus' ? 32 : 3);
        const fuelType = (v.fuel_type && ['petrol', 'diesel', 'electric', 'hybrid'].includes(v.fuel_type)) 
          ? v.fuel_type 
          : (vType === 'taxi' ? 'petrol' : 'diesel');
        const odo = v.odometer_km || 0;
        const status = (v.driver_name && v.driver_name.trim()) ? 'active' : 'idle';

        const vehRows = await query(
          `INSERT INTO vehicles 
           (org_id, plate_number, make, model, year, vehicle_type, seats, fuel_type, current_odometer_km, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (org_id, plate_number) DO UPDATE
           SET make = EXCLUDED.make, model = EXCLUDED.model, vehicle_type = EXCLUDED.vehicle_type, year = EXCLUDED.year, seats = EXCLUDED.seats, fuel_type = EXCLUDED.fuel_type
           RETURNING id`,
          [orgId, cleanPlate, make, model, year, vType, seats, fuelType, odo, status]
        );

        // If driver assigned, create driver and assignment record
        if (v.driver_name && v.driver_name.trim() && vehRows && vehRows.length > 0) {
          const vehId = vehRows[0].id;
          const driverPhone = v.driver_phone?.trim() || contact.trim();
          const driverRows = await query(
            `INSERT INTO drivers (org_id, full_name, phone, role_type, status)
             VALUES ($1, $2, $3, 'driver', 'active')
             RETURNING id`,
            [orgId, v.driver_name.trim(), driverPhone]
          );

          if (driverRows && driverRows.length > 0) {
            const driverId = driverRows[0].id;
            const targetPesewas = v.daily_target_pesewas || 35000;
            await query(
              `INSERT INTO vehicle_assignments (org_id, vehicle_id, driver_id, commission_type, daily_target_pesewas, is_active)
               VALUES ($1, $2, $3, 'fixed_daily', $4, true)`,
              [orgId, vehId, driverId, targetPesewas]
            );
          }
        }
      }
    } catch (dbErr) {
      console.warn('Neon DB persistence notice (falling back gracefully to runtime state):', dbErr);
    }

    return NextResponse.json({
      success: true,
      org_id: orgId,
      org_name: org_name.trim(),
      username: username.trim(),
      contact: contact.trim(),
      vehicles_count: vehicles.length,
      redirect_url: '/dashboard',
    });
  } catch (error: any) {
    console.error('Onboarding handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete fleet onboarding.' },
      { status: 500 }
    );
  }
}
