import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrator session required.' }, { status: 401 });
  }

  const reportData = {
    generated_at: new Date().toISOString(),
    reporting_period: 'Last 30 Days (October 2026)',
    kpis: {
      total_fleet_distance_km: 142850,
      active_vehicle_utilization_percent: 88.4,
      fuel_efficiency_km_per_liter: 9.8,
      speed_compliance_percent: 96.2,
      gps_telemetry_uptime_percent: 99.8,
      total_trips_completed: 4920,
      average_daily_revenue_per_vehicle_ghs: 380,
    },
    vehicle_types_breakdown: [
      { type: 'Trotro (Commuter Minibus)', count: 12, share_percent: 60 },
      { type: 'Taxi (Sedan / Hatchback)', count: 5, share_percent: 25 },
      { type: 'Hauling / Cargo Truck', count: 2, share_percent: 10 },
      { type: 'Intercity Bus', count: 1, share_percent: 5 },
    ],
    corridor_traffic_metrics: [
      {
        corridor: 'Tema Motorway & Port Artery',
        avg_speed_kmh: 58,
        congestion_index: 'Moderate',
        pings_recorded: 28400,
      },
      {
        corridor: 'Kwame Nkrumah Interchange (Circle)',
        avg_speed_kmh: 22,
        congestion_index: 'High',
        pings_recorded: 41200,
      },
      {
        corridor: 'Mallam - Kasoa Highway',
        avg_speed_kmh: 46,
        congestion_index: 'Moderate',
        pings_recorded: 19800,
      },
      {
        corridor: 'Achimota - Neoplan Terminal Artery',
        avg_speed_kmh: 31,
        congestion_index: 'Moderate-High',
        pings_recorded: 23100,
      },
    ],
    safety_summary: {
      total_incidents_recorded: 14,
      overspeed_events: 5,
      mechanical_breakdowns: 6,
      geofence_anomalies: 3,
      resolved_incidents: 11,
      resolution_rate_percent: 78.6,
    },
  };

  return NextResponse.json({
    success: true,
    data: reportData,
  });
}
