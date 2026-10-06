import { NextRequest, NextResponse } from 'next/server';
import { sanitizePlainText } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const { clientReference } = await request.json();

    const cleanRef = sanitizePlainText(clientReference, 64);
    if (!cleanRef) {
      return NextResponse.json({ error: 'Missing or invalid clientReference parameter' }, { status: 400 });
    }

    // In production, queries Hubtel Merchant Status Check API
    // Returns current transaction status
    return NextResponse.json({
      clientReference,
      status: 'paid',
      amountPesewas: 35000,
      hubtelTransactionId: `HUB_STATUS_${Date.now()}`,
      checkedAt: new Date().toISOString(),
      providerResponseCode: '0000',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
