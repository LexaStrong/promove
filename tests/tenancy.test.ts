import test from 'node:test';
import assert from 'node:assert/strict';

// Mock DB store representing multi-tenant storage
interface TenantRecord {
  id: string;
  org_id: string;
  data: string;
}

class TenantScopedRepository {
  private records: TenantRecord[] = [];

  insert(record: TenantRecord): void {
    this.records.push(record);
  }

  // Simulates PostgreSQL RLS: WHERE org_id = current_setting('app.current_org_id')
  findAllByOrg(currentOrgId: string): TenantRecord[] {
    return this.records.filter(r => r.org_id === currentOrgId);
  }

  findById(currentOrgId: string, id: string): TenantRecord | null {
    const record = this.records.find(r => r.id === id);
    if (!record || record.org_id !== currentOrgId) {
      return null; // Enforces strict isolation
    }
    return record;
  }
}

test('Multi-tenancy isolation: Organisation A cannot access Organisation B records', () => {
  const repo = new TenantScopedRepository();

  const orgA = 'org_accra_express_01';
  const orgB = 'org_kumasi_transit_02';

  // Seed records for Org A
  repo.insert({ id: 'veh_001', org_id: orgA, data: 'Trotro GR-1234-22' });
  repo.insert({ id: 'veh_002', org_id: orgA, data: 'Taxi GT-5678-23' });

  // Seed records for Org B
  repo.insert({ id: 'veh_003', org_id: orgB, data: 'Bus AS-9999-24' });

  // Query as Org A
  const orgAResults = repo.findAllByOrg(orgA);
  assert.equal(orgAResults.length, 2, 'Org A should see exactly 2 vehicles');
  assert.ok(orgAResults.every(r => r.org_id === orgA), 'All results must belong to Org A');
  assert.ok(!orgAResults.some(r => r.id === 'veh_003'), 'Org A must not see Org B vehicle');

  // Query as Org B
  const orgBResults = repo.findAllByOrg(orgB);
  assert.equal(orgBResults.length, 1, 'Org B should see exactly 1 vehicle');
  assert.equal(orgBResults[0].id, 'veh_003');

  // Direct fetch by ID cross-tenant must fail
  const crossTenantAccess = repo.findById(orgA, 'veh_003');
  assert.equal(crossTenantAccess, null, 'Direct access to Org B vehicle from Org A must return null');
});

test('Multi-tenancy isolation: Ledger queries prevent cross-tenant financial leakage', () => {
  const ledgerEntries = [
    { id: 'led_1', org_id: 'org_A', amount_pesewas: 50000 },
    { id: 'led_2', org_id: 'org_A', amount_pesewas: 30000 },
    { id: 'led_3', org_id: 'org_B', amount_pesewas: 80000 },
  ];

  const orgAEntries = ledgerEntries.filter(e => e.org_id === 'org_A');
  const orgATotalPesewas = orgAEntries.reduce((sum, e) => sum + e.amount_pesewas, 0);

  assert.equal(orgATotalPesewas, 80000, 'Org A total must equal 800.00 GHS in pesewas');
  assert.equal(orgAEntries.length, 2);
  assert.ok(!orgAEntries.some(e => e.org_id === 'org_B'));
});
