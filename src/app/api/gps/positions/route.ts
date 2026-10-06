import { NextResponse } from 'next/server';
import { telemetryHub } from '@/lib/gps/telemetry-hub';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isSse = searchParams.get('stream') === 'true' || req.headers.get('accept')?.includes('text/event-stream');

  const positions = telemetryHub.getAllPositions();
  const alerts = telemetryHub.getAlerts();

  if (!isSse) {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: positions.length,
      positions,
      alerts,
    });
  }

  // Server-Sent Events Stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const payload = JSON.stringify({ positions, alerts, timestamp: new Date().toISOString() });
      controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
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
