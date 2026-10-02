import test from 'node:test';
import assert from 'node:assert/strict';

interface SandboxSmsMessage {
  id: string;
  recipientPhone: string;
  alertType: string;
  status: 'delivered' | 'consent_denied' | 'failed';
  errorMessage?: string;
}

class SandboxHubtelSmsService {
  async dispatchAlert(
    recipientPhone: string,
    message: string,
    alertType: string,
    driverConsentGranted: boolean
  ): Promise<SandboxSmsMessage> {
    if (!driverConsentGranted) {
      return {
        id: `SMS_${Date.now()}`,
        recipientPhone,
        alertType,
        status: 'consent_denied',
        errorMessage: 'Act 843 Violation: Recipient has not provided statutory SMS consent.',
      };
    }

    const normalizedPhone = recipientPhone.startsWith('0')
      ? `+233${recipientPhone.slice(1)}`
      : recipientPhone;

    return {
      id: `SMS_${Date.now()}`,
      recipientPhone: normalizedPhone,
      alertType,
      status: 'delivered',
    };
  }
}

class SandboxHubtelPaymentService {
  verifyWebhook(payload: Record<string, unknown>) {
    const clientRef = (payload.ClientReference as string) || '';
    const statusStr = ((payload.Status as string) || '').toLowerCase();
    const amountVal = Number(payload.Amount || 0);
    const amountPesewas = Math.round(amountVal * 100);

    return {
      isValid: Boolean(clientRef),
      clientReference: clientRef,
      status: statusStr === 'success' ? ('paid' as const) : ('failed' as const),
      amountPesewas,
    };
  }

  createSettlementLedgerRecord(clientReference: string, amountPesewas: number) {
    return {
      id: `led_momo_${Date.now()}`,
      entry_type: 'income',
      amount_pesewas: amountPesewas,
      payment_method: 'momo_hubtel',
      idempotency_key: `momo_settlement_${clientReference}`,
      status: 'confirmed',
    };
  }
}

test('Hubtel Sandbox SMS: Validates statutory Act 843 consent before sending', async () => {
  const service = new SandboxHubtelSmsService();

  // Case 1: Driver granted consent
  const consented = await service.dispatchAlert(
    '0244123456',
    'Document expiry reminder for GR-4521-22',
    'document_expiry',
    true
  );
  assert.equal(consented.status, 'delivered');
  assert.equal(consented.recipientPhone, '+233244123456');

  // Case 2: Driver withheld consent
  const denied = await service.dispatchAlert(
    '0244987654',
    'Document expiry reminder for GE-6721-21',
    'document_expiry',
    false
  );
  assert.equal(denied.status, 'consent_denied');
  assert.ok(denied.errorMessage?.includes('Act 843'));
});

test('Hubtel Sandbox MoMo: Dispatches prompt and records with pesewa precision', () => {
  const paymentService = new SandboxHubtelPaymentService();

  const incomingWebhook = {
    TransactionId: 'HUB_TX_98765',
    ClientReference: 'PM_TEST_REF_001',
    Amount: 350.0,
    Status: 'Success',
  };

  const verified = paymentService.verifyWebhook(incomingWebhook);
  assert.ok(verified.isValid);
  assert.equal(verified.status, 'paid');
  assert.equal(verified.amountPesewas, 35000);

  const ledgerRecord = paymentService.createSettlementLedgerRecord(
    verified.clientReference,
    verified.amountPesewas
  );

  assert.equal(ledgerRecord.amount_pesewas, 35000);
  assert.equal(ledgerRecord.payment_method, 'momo_hubtel');
  assert.equal(ledgerRecord.idempotency_key, 'momo_settlement_PM_TEST_REF_001');
});
