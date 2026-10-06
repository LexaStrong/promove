/**
 * Per-user fleet storage.
 *
 * Every fleet collection is stored under a key scoped to the signed-in user's
 * ID, so a freshly signed-up account can never read data left in the browser
 * by a previous account or by the demo dashboard.
 */

export const FLEET_STORAGE_BASE = {
  FLEET_INFO: 'promove_registered_fleet',
  VEHICLES: 'promove_fleet_vehicles',
  DRIVERS: 'promove_fleet_drivers',
  LEDGER: 'promove_fleet_ledger',
  MAINTENANCE: 'promove_fleet_maintenance',
  DOCUMENTS: 'promove_fleet_documents',
  INCIDENTS: 'promove_fleet_incidents',
  FUEL: 'promove_fleet_fuel',
  TRIPS: 'promove_fleet_trips',
  NOTIFICATIONS: 'promove_fleet_notifications',
} as const;

export type FleetStorageBase = (typeof FLEET_STORAGE_BASE)[keyof typeof FLEET_STORAGE_BASE];

/** Build the storage key for a collection, scoped to a specific user. */
export function fleetKey(base: FleetStorageBase, userId: string | null | undefined): string {
  return `${base}::${userId || 'anonymous'}`;
}

/** Remove legacy unscoped keys that older builds wrote and shared across accounts. */
export function purgeLegacyFleetKeys(): void {
  if (typeof window === 'undefined') return;
  Object.values(FLEET_STORAGE_BASE).forEach(base => {
    try {
      localStorage.removeItem(base);
    } catch {
      // ignore
    }
  });
}

/** Seed a user's fleet workspace (used by onboarding). */
export function writeFleetWorkspace(
  userId: string | null | undefined,
  fleetInfo: unknown,
  vehicles: unknown[] = [],
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(fleetKey(FLEET_STORAGE_BASE.FLEET_INFO, userId), JSON.stringify(fleetInfo));
    localStorage.setItem(fleetKey(FLEET_STORAGE_BASE.VEHICLES, userId), JSON.stringify(vehicles));
    (
      [
        FLEET_STORAGE_BASE.DRIVERS,
        FLEET_STORAGE_BASE.LEDGER,
        FLEET_STORAGE_BASE.MAINTENANCE,
        FLEET_STORAGE_BASE.DOCUMENTS,
        FLEET_STORAGE_BASE.INCIDENTS,
        FLEET_STORAGE_BASE.FUEL,
        FLEET_STORAGE_BASE.TRIPS,
        FLEET_STORAGE_BASE.NOTIFICATIONS,
      ] as FleetStorageBase[]
    ).forEach(base => localStorage.setItem(fleetKey(base, userId), JSON.stringify([])));
  } catch {
    // Storage may be unavailable; the app still works with in-memory state.
  }
}
