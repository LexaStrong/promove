import { NextResponse } from 'next/server';

export async function GET() {
  const encoder = new TextEncoder();

  // Mock fleet live positions in Greater Accra
  const liveFleet = [
    {
      vehicleId: 'veh-1',
      plateNumber: 'GR-4521-22',
      driverName: 'Kwame Mensah',
      latitude: 5.5562,
      longitude: -0.2012,
      speedKmh: 42,
      courseHeading: 85,
      ignition: true,
      status: 'moving',
      locationLabel: 'Kwame Nkrumah Interchange, Circle',
      timestamp: new Date().toISOString(),
    },
    {
      vehicleId: 'veh-2',
      plateNumber: 'GT-1892-23',
      driverName: 'Kofi Owusu',
      latitude: 5.5324,
      longitude: -0.3541,
      speedKmh: 68,
      courseHeading: 260,
      ignition: true,
      status: 'moving',
      locationLabel: 'Kasoa Tollbooth, Winneba Rd',
      timestamp: new Date().toISOString(),
    },
    {
      vehicleId: 'veh-3',
      plateNumber: 'GE-6721-21',
      driverName: 'Emmanuel Osei',
      latitude: 5.6037,
      longitude: -0.187,
      speedKmh: 0,
      courseHeading: 0,
      ignition: false,
      status: 'parked',
      locationLabel: 'Achimota Neoplan Terminal',
      timestamp: new Date().toISOString(),
    },
    {
      vehicleId: 'veh-4',
      plateNumber: 'GW-3312-22',
      driverName: 'Yaw Boateng',
      latitude: 5.651,
      longitude: -0.1654,
      speedKmh: 0,
      courseHeading: 0,
      ignition: true,
      status: 'idle',
      locationLabel: 'Madina Zongo Junction',
      timestamp: new Date().toISOString(),
    },
  ];

  const stream = new ReadableStream({
    start(controller) {
      // Send initial snapshot
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(liveFleet)}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
