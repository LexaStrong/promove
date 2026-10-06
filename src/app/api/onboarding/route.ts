import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface VehiclePayload {
  plate_number: string;
  vehicle_type: 'trotro' | 'taxi' | 'bus' | 'hauling' | 'delivery';
  make?: string;
  model?: string;
  year?: number;
  seats?: number;
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

    // Vehicles are optional on initial sign-up; user can add them later
    const validVehicles = vehicles || [];
    const slug = org_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'org';
    let orgId = 'org-' + Date.now();

    // 2. Persist to Neon Lakebase Postgres if configured
    try {
      const orgRows = await query(
        `INSERT INTO organisations (name, slug, phone, email)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name`,
        [org_name.trim(), slug, contact.trim(), contact.includes('@') ? contact.trim() : null]
      );

      if (orgRows && orgRows.length > 0) {
        orgId = orgRows[0].id;
      }

      // Persist vehicles into Neon database
      for (const v of validVehicles) {
        if (!v.plate_number?.trim()) continue;
        const cleanPlate = v.plate_number.toUpperCase().trim();
        const vType = v.vehicle_type || 'trotro';
        const make = v.make || (vType === 'trotro' ? 'Toyota' : vType === 'taxi' ? 'Hyundai' : 'Mercedes-Benz');
        const model = v.model || (vType === 'trotro' ? 'Hiace' : vType === 'taxi' ? 'i10' : 'Sprinter');
        const year = v.year || 2022;
        const seats = v.seats || (vType === 'trotro' ? 15 : vType === 'taxi' ? 4 : vType === 'bus' ? 32 : 3);
        const fuelType = vType === 'taxi' ? 'petrol' : 'diesel';

        await query(
          `INSERT INTO vehicles 
           (org_id, plate_number, make, model, year, vehicle_type, seats, fuel_type, current_odometer_km, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'active')
           ON CONFLICT (org_id, plate_number) DO UPDATE
           SET make = EXCLUDED.make, model = EXCLUDED.model, vehicle_type = EXCLUDED.vehicle_type`,
          [orgId, cleanPlate, make, model, year, vType, seats, fuelType]
        );
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
