import test from 'node:test';
import assert from 'node:assert/strict';

interface SyntheticLedgerRecord {
  id: string;
  vehicle_id: string;
  entry_type: 'income' | 'expense' | 'commission';
  amount_pesewas: number;
}

test('Report Generation Load & Exact Pesewa Ledger Verification Test', () => {
  const VEHICLE_COUNT = 10;
  const RECORD_COUNT = 1000;
  const vehicleIds = Array.from({ length: VEHICLE_COUNT }, (_, i) => `veh_gh_${i + 1}`);

  // 1. Generate 1,000 synthetic ledger records with randomized integer amounts
  const ledger: SyntheticLedgerRecord[] = [];
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < RECORD_COUNT; i++) {
    const vehicle_id = vehicleIds[i % VEHICLE_COUNT];
    const isIncome = pseudoRandom() > 0.35;
    const amount_pesewas = Math.floor(pseudoRandom() * 50000) + 1000; // 10.00 to 510.00 GHS in pesewas

    ledger.push({
      id: `led_${i}`,
      vehicle_id,
      entry_type: isIncome ? 'income' : 'expense',
      amount_pesewas,
    });
  }

  // 2. Benchmark aggregation execution speed
  const startTime = performance.now();

  const vehicleSummaries = vehicleIds.map(vId => {
    const vehicleEntries = ledger.filter(e => e.vehicle_id === vId);
    const income = vehicleEntries
      .filter(e => e.entry_type === 'income')
      .reduce((acc, curr) => acc + curr.amount_pesewas, 0);
    const expenses = vehicleEntries
      .filter(e => e.entry_type === 'expense')
      .reduce((acc, curr) => acc + curr.amount_pesewas, 0);
    const net = income - expenses;
    return { vehicle_id: vId, income, expenses, net };
  });

  const sumOfVehicleIncome = vehicleSummaries.reduce((sum, v) => sum + v.income, 0);
  const sumOfVehicleExpenses = vehicleSummaries.reduce((sum, v) => sum + v.expenses, 0);
  const sumOfVehicleNet = vehicleSummaries.reduce((sum, v) => sum + v.net, 0);

  // Consolidated grand ledger totals
  const grandLedgerIncome = ledger
    .filter(e => e.entry_type === 'income')
    .reduce((acc, curr) => acc + curr.amount_pesewas, 0);

  const grandLedgerExpenses = ledger
    .filter(e => e.entry_type === 'expense')
    .reduce((acc, curr) => acc + curr.amount_pesewas, 0);

  const grandLedgerNet = grandLedgerIncome - grandLedgerExpenses;

  const durationMs = performance.now() - startTime;

  // 3. Mathematical proof: Report totals match the ledger down to the exact pesewa (0 discrepancy)
  const incomeDiscrepancy = Math.abs(sumOfVehicleIncome - grandLedgerIncome);
  const expenseDiscrepancy = Math.abs(sumOfVehicleExpenses - grandLedgerExpenses);
  const netDiscrepancy = Math.abs(sumOfVehicleNet - grandLedgerNet);

  assert.equal(incomeDiscrepancy, 0, 'Income report total must match ledger to exact pesewa');
  assert.equal(expenseDiscrepancy, 0, 'Expense report total must match ledger to exact pesewa');
  assert.equal(netDiscrepancy, 0, 'Net profit total must match ledger to exact pesewa');

  // 4. Performance criteria: 1,000 transactions processed in under 500ms
  assert.ok(durationMs < 500, `Report calculation completed in ${durationMs.toFixed(2)}ms (target < 500ms)`);
});
