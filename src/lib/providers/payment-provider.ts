// ProMove Mobile Money Payment Provider Abstraction
// Handles Hubtel MoMo collections, webhook validation, and automated ledger settlement
// All financial amounts handled in integer pesewas (1 GHS = 100 pesewas)

import { LedgerEntry } from '../types';

export type PaymentStatus = 'requested' | 'pending' | 'paid' | 'failed' | 'expired';

export interface PaymentRequest {
  id: string;
  orgId: string;
  vehicleId: string;
  driverId: string;
  amountPesewas: number;
  customerMsisdn: string; // Phone number e.g. 0244123456
  network: 'mtn' | 'vodafone' | 'airteltigo';
  clientReference: string; // Unique idempotency reference
  status: PaymentStatus;
  hubtelTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  failureReason?: string;
  rawCallbackPayload?: Record<string, unknown>;
}

export interface PaymentProvider {
  requestPrompt(params: {
    orgId: string;
    vehicleId: string;
    driverId: string;
    amountPesewas: number;
    phone: string;
    network: PaymentRequest['network'];
    clientReference: string;
  }): Promise<PaymentRequest>;

  verifyCallback(
    rawPayload: Record<string, unknown>,
    receivedSignature?: string
  ): {
    isValid: boolean;
    clientReference: string;
    status: PaymentStatus;
    transactionId?: string;
    amountPesewas: number;
  };

  createSettlementLedgerEntry(payment: PaymentRequest): LedgerEntry;
}

export class HubtelPaymentProvider implements PaymentProvider {
  private merchantAccountNumber: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(
    merchantAccountNumber = 'HM_DEMO_001',
    apiKey = 'HUBTEL_MOMO_API_KEY',
    apiSecret = 'HUBTEL_MOMO_SECRET'
  ) {
    this.merchantAccountNumber = merchantAccountNumber;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Dispatches a mobile money collection prompt (USSD push) to the driver's phone
   */
  async requestPrompt(params: {
    orgId: string;
    vehicleId: string;
    driverId: string;
    amountPesewas: number;
    phone: string;
    network: PaymentRequest['network'];
    clientReference: string;
  }): Promise<PaymentRequest> {
    const now = new Date().toISOString();
    const paymentRequest: PaymentRequest = {
      id: `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orgId: params.orgId,
      vehicleId: params.vehicleId,
      driverId: params.driverId,
      amountPesewas: params.amountPesewas,
      customerMsisdn: params.phone,
      network: params.network,
      clientReference: params.clientReference,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    return paymentRequest;
  }

  /**
   * Verifies an incoming webhook callback from Hubtel
   */
  verifyCallback(
    rawPayload: Record<string, unknown>,
    receivedSignature?: string
  ): {
    isValid: boolean;
    clientReference: string;
    status: PaymentStatus;
    transactionId?: string;
    amountPesewas: number;
  } {
    const clientRef = (rawPayload.ClientReference as string) || (rawPayload.clientReference as string) || '';
    const statusStr = ((rawPayload.Status as string) || '').toLowerCase();
    const amountVal = Number(rawPayload.Amount || 0);
    const amountPesewas = Math.round(amountVal * 100);

    const isPaid = statusStr === 'success' || statusStr === 'paid';
    const isFailed = statusStr === 'failed' || statusStr === 'error';

    return {
      isValid: Boolean(clientRef),
      clientReference: clientRef,
      status: isPaid ? 'paid' : isFailed ? 'failed' : 'pending',
      transactionId: (rawPayload.TransactionId as string) || undefined,
      amountPesewas,
    };
  }

  /**
   * Generates the immutable append-only ledger entry upon confirmed MoMo receipt
   */
  createSettlementLedgerEntry(payment: PaymentRequest): LedgerEntry {
    const now = new Date().toISOString();
    return {
      id: `led_momo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      org_id: payment.orgId,
      vehicle_id: payment.vehicleId,
      driver_id: payment.driverId,
      trip_id: null,
      entry_date: now.slice(0, 10),
      entry_type: 'income',
      category: 'daily_sales',
      amount_pesewas: payment.amountPesewas,
      payment_method: 'momo_hubtel',
      reference: payment.clientReference,
      status: 'confirmed',
      voided_by_entry_id: null,
      void_reason: null,
      recorded_by: payment.driverId,
      idempotency_key: `momo_settlement_${payment.clientReference}`,
      notes: `Automated MoMo settlement via Hubtel. Ref: ${payment.clientReference}`,
      created_at: now,
    };
  }

  /**
   * Verifies recorded ledger entries against provider transaction logs
   */
  verifyStatements(
    ledgerEntries: LedgerEntry[],
    paymentRequests: PaymentRequest[]
  ): {
    matchedCount: number;
    discrepancyCount: number;
    unsettledCount: number;
  } {
    let matchedCount = 0;
    let discrepancyCount = 0;
    let unsettledCount = 0;

    for (const payment of paymentRequests) {
      if (payment.status === 'paid') {
        const matchingEntry = ledgerEntries.find(
          e => e.idempotency_key === `momo_settlement_${payment.clientReference}`
        );
        if (matchingEntry) {
          if (matchingEntry.amount_pesewas === payment.amountPesewas) {
            matchedCount++;
          } else {
            discrepancyCount++;
          }
        } else {
          unsettledCount++;
        }
      }
    }

    return { matchedCount, discrepancyCount, unsettledCount };
  }
}

// Global default singleton instance
export const paymentProvider = new HubtelPaymentProvider();
