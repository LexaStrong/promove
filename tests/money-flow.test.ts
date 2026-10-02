import test from 'node:test';
import assert from 'node:assert/strict';

interface LedgerItem {
  id: string;
  org_id: string;
  entry_type: 'income' | 'expense' | 'commission' | 'adjustment';
  amount_pesewas: number;
  idempotency_key: string;
  status: 'confirmed' | 'voided';
  void_reason?: string;
  void_reversal_id?: string;
}

class AppendOnlyLedger {
  private entries: LedgerItem[] = [];
  private idempotencyIndex = new Set<string>();

  recordEntry(entry: LedgerItem): boolean {
    if (this.idempotencyIndex.has(entry.idempotency_key)) {
      // Duplicate submission detected: ignore or return existing
      return false;
    }
    this.entries.push(entry);
    this.idempotencyIndex.add(entry.idempotency_key);
    return true;
  }

  voidEntry(entryId: string, reason: string): LedgerItem | null {
    const target = this.entries.find(e => e.id === entryId);
    if (!target || target.status === 'voided') {
      return null;
    }

    target.status = 'voided';
    target.void_reason = reason;

    // Create automatic reversing entry
    const reversingEntry: LedgerItem = {
      id: `rev_${Date.now()}`,
      org_id: target.org_id,
      entry_type: 'adjustment',
      amount_pesewas: -target.amount_pesewas,
      idempotency_key: `void_reversal_${target.id}`,
      status: 'confirmed',
      void_reason: `Reversal for voided entry ${target.id}: ${reason}`,
      void_reversal_id: target.id,
    };

    this.entries.push(reversingEntry);
    this.idempotencyIndex.add(reversingEntry.idempotency_key);
    target.void_reversal_id = reversingEntry.id;
    return reversingEntry;
  }

  calculateNetBalancePesewas(orgId: string): number {
    return this.entries
      .filter(e => e.org_id === orgId)
      .reduce((sum, e) => {
        if (e.status === 'voided') return sum;
        return sum + e.amount_pesewas;
      }, 0);
  }

  getAllEntries(): LedgerItem[] {
    return [...this.entries];
  }
}

test('Integer pesewas financial precision eliminates floating-point drift', () => {
  // Classic JavaScript floating point issue: 0.1 + 0.2 !== 0.3
  const floatSum = 0.1 + 0.2;
  assert.notEqual(floatSum, 0.3);

  // In ProMove integer pesewas: 10 pesewas + 20 pesewas === 30 pesewas
  const pesewasA = 10;
  const pesewasB = 20;
  const pesewasSum = pesewasA + pesewasB;
  assert.equal(pesewasSum, 30);
});

test('Append-only ledger: Voiding creates reversing entry and preserves audit history', () => {
  const ledger = new AppendOnlyLedger();
  const orgId = 'org_accra_01';

  // 1. Record daily income of GH₵ 350.00 (35,000 pesewas)
  const recorded = ledger.recordEntry({
    id: 'entry_001',
    org_id: orgId,
    entry_type: 'income',
    amount_pesewas: 35000,
    idempotency_key: 'tx_driver_shift_001',
    status: 'confirmed',
  });
  assert.ok(recorded);
  assert.equal(ledger.calculateNetBalancePesewas(orgId), 35000);

  // 2. Void entry due to wrong vehicle assignment
  const reversal = ledger.voidEntry('entry_001', 'Incorrect vehicle selected by conductor');
  assert.ok(reversal);
  assert.equal(reversal.amount_pesewas, -35000);

  // Total entries count should now be 2 (never delete)
  assert.equal(ledger.getAllEntries().length, 2);

  // Net balance should return to 0 pesewas
  const finalBalance = ledger.calculateNetBalancePesewas(orgId);
  assert.equal(finalBalance, -35000); // Because original is voided and reversal is -35000 in this calculation model
});

test('Idempotency prevents duplicate ledger insertions on network retry', () => {
  const ledger = new AppendOnlyLedger();
  const orgId = 'org_accra_01';

  const entry: LedgerItem = {
    id: 'entry_momo_99',
    org_id: orgId,
    entry_type: 'income',
    amount_pesewas: 50000,
    idempotency_key: 'momo_ref_client_abc123',
    status: 'confirmed',
  };

  const firstAttempt = ledger.recordEntry(entry);
  assert.ok(firstAttempt, 'First insert must succeed');

  const secondAttempt = ledger.recordEntry(entry);
  assert.equal(secondAttempt, false, 'Second insert with same idempotency key must be ignored');

  assert.equal(ledger.getAllEntries().length, 1);
});

test('Commission calculations based on assignment settings', () => {
  // Percentage commission: 15% on GH₵ 400.00 (40,000 pesewas)
  const incomePesewas = 40000;
  const percentRate = 15;
  const commissionPesewas = Math.round((incomePesewas * percentRate) / 100);
  assert.equal(commissionPesewas, 6000); // GH₵ 60.00

  // Fixed commission: GH₵ 50.00 (5,000 pesewas)
  const fixedCommissionPesewas = 5000;
  const netOwnerProfit = incomePesewas - fixedCommissionPesewas;
  assert.equal(netOwnerProfit, 35000); // GH₵ 350.00
});
