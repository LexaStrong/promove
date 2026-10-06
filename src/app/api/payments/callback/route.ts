import { NextRequest, NextResponse } from 'next/server';
import { paymentProvider } from '@/lib/providers/payment-provider';

// Storage for dispute investigation
const rawCallbackLogs: Array<{
  timestamp: string;
  clientReference: string;
  payload: Record<string, unknown>;
  ip: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const signature = request.headers.get('x-hubtel-signature') || undefined;
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Verify webhook payload
    const verification = paymentProvider.verifyCallback(rawBody, signature);

    if (!verification.isValid) {
      return NextResponse.json(
        { error: 'Invalid Hubtel callback payload or missing reference' },
        { status: 400 }
      );
    }

    // Store raw payload for dispute handling (bounded ring buffer to prevent memory leaks)
    rawCallbackLogs.push({
      timestamp: new Date().toISOString(),
      clientReference: verification.clientReference,
      payload: rawBody,
      ip,
    });
    if (rawCallbackLogs.length > 100) {
      rawCallbackLogs.shift();
    }

    if (verification.status === 'paid') {
      // Create confirmed ledger entry
      const syntheticPayment = {
        id: `pay_${Date.now()}`,
        orgId: (rawBody.OrgId as string) || 'org_gh_01',
        vehicleId: (rawBody.VehicleId as string) || 'veh-1',
        driverId: (rawBody.DriverId as string) || 'drv-1',
        amountPesewas: verification.amountPesewas,
        customerMsisdn: (rawBody.CustomerMsisdn as string) || '0244123456',
        network: 'mtn' as const,
        clientReference: verification.clientReference,
        status: 'paid' as const,
        hubtelTransactionId: verification.transactionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        rawCallbackPayload: rawBody,
      };

      const ledgerEntry = paymentProvider.createSettlementLedgerEntry(syntheticPayment);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and ledger entry created',
        clientReference: verification.clientReference,
        ledgerEntryId: ledgerEntry.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${verification.status}`,
      clientReference: verification.clientReference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    receiver: 'Hubtel Mobile Money Webhook Gateway',
    timestamp: new Date().toISOString(),
  });
}
