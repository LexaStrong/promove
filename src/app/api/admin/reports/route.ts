import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrator session required.' }, { status: 401 });
  }

  try {
    // 1. Fetch real counts from Neon Database
    let vehicleTypeRows: any[] = [];
    let orgCount = 0;
    let totalVehicles = 0;
    let totalOdometer = 0;
    let incidentRows: any[] = [];
    let ledgerIncomePesewas = 0;
    let ledgerTxCount = 0;

    try {
      const [vRows, oRows, iRows, lRows] = await Promise.all([
        query(`SELECT vehicle_type, count(*)::int as count, coalesce(sum(current_odometer_km), 0)::bigint as total_km FROM vehicles GROUP BY vehicle_type`),
        query(`SELECT count(*)::int as count FROM organisations`),
        query(`SELECT status, severity, count(*)::int as count FROM incidents GROUP BY status, severity`),
        query(`SELECT coalesce(sum(amount_pesewas), 0)::bigint as total_pesewas, count(*)::int as count FROM ledger WHERE entry_type = 'income'`),
      ]);

      vehicleTypeRows = vRows || [];
      orgCount = Number(oRows?.[0]?.count || 0);
      incidentRows = iRows || [];
      ledgerIncomePesewas = Number(lRows?.[0]?.total_pesewas || 0);
      ledgerTxCount = Number(lRows?.[0]?.count || 0);

      for (const row of vehicleTypeRows) {
        totalVehicles += Number(row.count || 0);
        totalOdometer += Number(row.total_km || 0);
      }
    } catch (dbErr) {
      console.warn('Neon DB query warning in admin/reports:', dbErr);
    }

    // Vehicle breakdown
    const vehicleTypeLabels: Record<string, string> = {
      trotro: 'Trotro (Commuter Minibus)',
      taxi: 'Taxi (Sedan / Hatchback)',
      bus: 'Intercity Transport Bus',
      hauling: 'Hauling / Cargo Truck',
    };

    const vehicleTypesBreakdown = vehicleTypeRows.map((r) => {
      const count = Number(r.count || 0);
      const share = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
      return {
        type: vehicleTypeLabels[r.vehicle_type] || r.vehicle_type || 'Commercial Vehicle',
        count,
        share_percent: share,
      };
    });

    const totalIncidents = incidentRows.reduce((acc, row) => acc + Number(row.count || 0), 0);
    const resolvedIncidents = incidentRows
      .filter((r) => r.status === 'resolved')
      .reduce((acc, row) => acc + Number(row.count || 0), 0);

    const reportData = {
      generated_at: new Date().toISOString(),
      reporting_period: 'Live Operations (Current Database Records)',
      kpis: {
        total_registered_organisations: orgCount,
        total_fleet_vehicles: totalVehicles,
        total_fleet_odometer_km: totalOdometer,
        total_ledger_income_ghs: Math.round(ledgerIncomePesewas / 100),
        total_ledger_transactions: ledgerTxCount,
        total_incidents: totalIncidents,
        resolved_incidents: resolvedIncidents,
      },
      vehicle_types_breakdown: vehicleTypesBreakdown,
      corridor_traffic_metrics: [
        {
          corridor: 'Tema Motorway & Port Artery',
          status: 'Operational',
          speed_limit_kmh: 90,
        },
        {
          corridor: 'Kwame Nkrumah Interchange (Circle)',
          status: 'Operational',
          speed_limit_kmh: 50,
        },
        {
          corridor: 'Mallam - Kasoa Highway',
          status: 'Operational',
          speed_limit_kmh: 80,
        },
        {
          corridor: 'Achimota - Neoplan Terminal Artery',
          status: 'Operational',
          speed_limit_kmh: 50,
        },
      ],
      safety_summary: {
        total_incidents_recorded: totalIncidents,
        resolved_incidents: resolvedIncidents,
        resolution_rate_percent: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100,
      },
    };

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error: any) {
    console.error('Admin reports API error:', error);
    return NextResponse.json({ error: 'Failed to aggregate platform reports.' }, { status: 500 });
  }
}
