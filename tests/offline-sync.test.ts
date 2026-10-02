import test from 'node:test';
import assert from 'node:assert/strict';

interface OfflineQueueItem {
  client_uuid: string;
  idempotency_key: string;
  entry_type: 'income' | 'expense' | 'fuel';
  amount_pesewas: number;
  vehicle_id: string;
  driver_id: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

class DriverOfflineSyncEngine {
  private localQueue: OfflineQueueItem[] = [];
  private serverLedger: Map<string, OfflineQueueItem> = new Map();

  // Driver saves an entry on phone (offline first)
  enqueueOfflineEntry(params: Omit<OfflineQueueItem, 'client_uuid' | 'idempotency_key' | 'sync_status'>): OfflineQueueItem {
    const client_uuid = `uuid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotency_key = `idem_${client_uuid}`;

    const queueItem: OfflineQueueItem = {
      ...params,
      client_uuid,
      idempotency_key,
      sync_status: 'pending',
    };

    this.localQueue.push(queueItem);
    return queueItem;
  }

  // Sync engine runs when phone regains 3G signal
  async processSync(simulateNetworkDropOnFirstCall = false): Promise<{ syncedCount: number; duplicateIgnoredCount: number }> {
    let syncedCount = 0;
    let duplicateIgnoredCount = 0;
    let dropSimulated = false;

    for (const item of this.localQueue) {
      if (item.sync_status === 'synced') continue;

      if (simulateNetworkDropOnFirstCall && !dropSimulated && !this.serverLedger.has(item.idempotency_key)) {
        // First request reached server and saved, but acknowledgment was lost in transit
        this.serverLedger.set(item.idempotency_key, { ...item, sync_status: 'synced' });
        // Driver phone thinks it failed because response timed out
        item.sync_status = 'failed';
        dropSimulated = true;
        continue;
      }

      // Check if server already has this idempotency key
      if (this.serverLedger.has(item.idempotency_key)) {
        // Server recognizes duplicate and responds 200 OK without re-inserting
        item.sync_status = 'synced';
        duplicateIgnoredCount++;
      } else {
        this.serverLedger.set(item.idempotency_key, { ...item, sync_status: 'synced' });
        item.sync_status = 'synced';
        syncedCount++;
      }
    }

    return { syncedCount, duplicateIgnoredCount };
  }

  getLocalQueue(): OfflineQueueItem[] {
    return this.localQueue;
  }

  getServerLedgerCount(): number {
    return this.serverLedger.size;
  }
}

test('Offline queue: Driver logs entries offline and syncs with server without duplicate records', async () => {
  const engine = new DriverOfflineSyncEngine();

  // 1. Conductor logs 3 trips while driving in low-signal rural area
  const entry1 = engine.enqueueOfflineEntry({
    entry_type: 'income',
    amount_pesewas: 18000, // GH₵ 180.00
    vehicle_id: 'veh_trotro_01',
    driver_id: 'drv_kwame',
    created_at: new Date().toISOString(),
  });

  const entry2 = engine.enqueueOfflineEntry({
    entry_type: 'income',
    amount_pesewas: 22000, // GH₵ 220.00
    vehicle_id: 'veh_trotro_01',
    driver_id: 'drv_kwame',
    created_at: new Date().toISOString(),
  });

  const entry3 = engine.enqueueOfflineEntry({
    entry_type: 'expense',
    amount_pesewas: 5000, // GH₵ 50.00
    vehicle_id: 'veh_trotro_01',
    driver_id: 'drv_kwame',
    created_at: new Date().toISOString(),
  });

  assert.equal(engine.getLocalQueue().length, 3);
  assert.equal(engine.getServerLedgerCount(), 0, 'Server has 0 entries prior to sync');

  // 2. First sync attempt suffers dropped packet on entry 1
  await engine.processSync(true);

  // 3. Phone retries sync upon reconnection
  const retryResult = await engine.processSync(false);

  // Verification: All 3 items should now be synced on client
  assert.ok(engine.getLocalQueue().every(i => i.sync_status === 'synced'));

  // Verification: Server must have exactly 3 entries (zero duplicates caused by retry)
  assert.equal(engine.getServerLedgerCount(), 3);
  assert.equal(retryResult.duplicateIgnoredCount, 1, 'Retry recognized the idempotency key and avoided duplication');
});
