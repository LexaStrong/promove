'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import {
  Vehicle, Driver, LedgerEntry, MaintenanceRecord, MaintenanceSchedule,
  VehicleDocument, Incident, FuelLog, Trip, Notification, FleetStats,
} from './types';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import {
  mockVehicles, mockDrivers, mockLedgerEntries, mockMaintenanceRecords,
  mockMaintenanceSchedules, mockDocuments, mockIncidents, mockFuelLogs,
  mockTrips, mockNotifications, mockFleetStats,
} from './mock-data';
import { FLEET_STORAGE_BASE, fleetKey, purgeLegacyFleetKeys } from './fleet-storage';

interface FleetContextValue {
  isDemo: boolean;
  mounted: boolean;
  orgName: string;
  setOrgName: (name: string) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  ledgerEntries: LedgerEntry[];
  maintenanceRecords: MaintenanceRecord[];
  maintenanceSchedules: MaintenanceSchedule[];
  documents: VehicleDocument[];
  incidents: Incident[];
  fuelLogs: FuelLog[];
  trips: Trip[];
  notifications: Notification[];
  stats: FleetStats;
  addVehicle: (vehicle: Partial<Vehicle>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDriver: (driver: Partial<Driver>) => Driver;
  addLedgerEntry: (entry: Partial<LedgerEntry>) => LedgerEntry;
  voidLedgerEntry: (id: string, reason: string) => void;
  addMaintenanceRecord: (record: Partial<MaintenanceRecord>) => MaintenanceRecord;
  addDocument: (doc: Partial<VehicleDocument>) => VehicleDocument;
  addIncident: (incident: Partial<Incident>) => Incident;
  addFuelLog: (log: Partial<FuelLog>) => FuelLog;
  addTrip: (trip: Partial<Trip>) => Trip;
  clearAllData: () => void;
  resetToCleanState: () => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

type FleetKeyMap = { [K in keyof typeof FLEET_STORAGE_BASE]: string };

/** Every collection key, scoped to one user so accounts never share data. */
function buildFleetKeys(userId: string | null | undefined): FleetKeyMap {
  return Object.fromEntries(
    Object.entries(FLEET_STORAGE_BASE).map(([name, base]) => [name, fleetKey(base, userId)])
  ) as FleetKeyMap;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage (${key}):`, e);
  }
}

export function FleetProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, org } = useAuth();
  const userId = user?.id ?? null;
  const keysRef = useRef<FleetKeyMap>(buildFleetKeys(userId));
  keysRef.current = buildFleetKeys(userId);
  const [mounted, setMounted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // User's own live state (starts 100% clean and empty for new users)
  const [orgName, setOrgNameState] = useState('');
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [userDrivers, setUserDrivers] = useState<Driver[]>([]);
  const [userLedger, setUserLedger] = useState<LedgerEntry[]>([]);
  const [userMaintenance, setUserMaintenance] = useState<MaintenanceRecord[]>([]);
  const [userSchedules, setUserSchedules] = useState<MaintenanceSchedule[]>([]);
  const [userDocuments, setUserDocuments] = useState<VehicleDocument[]>([]);
  const [userIncidents, setUserIncidents] = useState<Incident[]>([]);
  const [userFuel, setUserFuel] = useState<FuelLog[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);

  // Check query params & initialize user storage whenever route changes
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo') === 'true';
    setIsDemo(demoParam);

    // If demo mode, we do not need to read user state
    if (demoParam) return;

    // Older builds stored fleet data under shared, unscoped keys; drop them
    purgeLegacyFleetKeys();

    // Load registered fleet info
    const registered = readStorage<any>(keysRef.current.FLEET_INFO, null);
    if (registered?.orgName && registered.orgName !== 'Twum Transport Services') {
      setOrgNameState(registered.orgName);
    } else if (org?.name && org.name !== 'Twum Transport Services') {
      setOrgNameState(org.name);
    } else {
      setOrgNameState('');
    }

    // Load registered vehicles from vehicles store or registered fleet
    const storedVehicles = readStorage<Vehicle[]>(keysRef.current.VEHICLES, []);
    const mockPlates = ['GR 4521-22', 'GW 3312-22', 'GE 3797-22', 'GS 8821-21', 'GT 6044-22', 'GN 1920-22', 'GX 5501-23', 'AS 8900-21'];
    const filteredVehicles = storedVehicles.filter(v => !mockPlates.includes(v.plate_number));

    if (filteredVehicles.length > 0) {
      setUserVehicles(filteredVehicles);
    } else if (registered?.vehicles && registered.vehicles.length > 0) {
      const validRegistered = registered.vehicles.filter((v: any) => !mockPlates.includes(v.plate_number));
      if (validRegistered.length > 0) {
        const mappedVehicles: Vehicle[] = validRegistered.map((v: any, index: number) => ({
          id: v.id || `veh-${Date.now()}-${index}`,
          org_id: 'org-user',
          plate_number: v.plate_number,
          make: v.make || 'Toyota',
          model: v.model || 'Hiace',
          year: v.year || 2023,
          vehicle_type: v.vehicle_type || 'trotro',
          colour: v.colour || 'White',
          vin: null,
          seats: v.seats || 15,
          fuel_type: v.fuel_type || 'diesel',
          odometer_km: v.odometer_km || 0,
          daily_target_pesewas: 35000,
          gps_device_id: null,
          archived_at: null,
          status: v.status || 'active',
          created_at: new Date().toISOString(),
        }));
        setUserVehicles(mappedVehicles);
        writeStorage(keysRef.current.VEHICLES, mappedVehicles);
      } else {
        setUserVehicles([]);
      }
    } else {
      setUserVehicles([]);
    }

    // Load other collections (all empty by default for fresh sign ups)
    setUserDrivers(readStorage<Driver[]>(keysRef.current.DRIVERS, []));
    setUserLedger(readStorage<LedgerEntry[]>(keysRef.current.LEDGER, []));
    setUserMaintenance(readStorage<MaintenanceRecord[]>(keysRef.current.MAINTENANCE, []));
    setUserDocuments(readStorage<VehicleDocument[]>(keysRef.current.DOCUMENTS, []));
    setUserIncidents(readStorage<Incident[]>(keysRef.current.INCIDENTS, []));
    setUserFuel(readStorage<FuelLog[]>(keysRef.current.FUEL, []));
    setUserTrips(readStorage<Trip[]>(keysRef.current.TRIPS, []));
    setUserNotifications(readStorage<Notification[]>(keysRef.current.NOTIFICATIONS, []));
    setUserSchedules([]);
  }, [pathname, userId, org?.name]);

  const setOrgName = useCallback((name: string) => {
    setOrgNameState(name);
    const existing = readStorage<any>(keysRef.current.FLEET_INFO, {});
    writeStorage(keysRef.current.FLEET_INFO, { ...existing, orgName: name });
  }, []);

  // Actions for modifying fleet data
  const addVehicle = useCallback((data: Partial<Vehicle>): Vehicle => {
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      plate_number: (data.plate_number || '').toUpperCase().trim(),
      make: data.make || 'Toyota',
      model: data.model || 'Hiace',
      year: data.year || 2023,
      vehicle_type: data.vehicle_type || 'trotro',
      colour: data.colour || 'White',
      vin: data.vin || null,
      seats: data.seats || 15,
      fuel_type: data.fuel_type || 'diesel',
      odometer_km: data.odometer_km || 0,
      daily_target_pesewas: data.daily_target_pesewas || 35000,
      gps_device_id: data.gps_device_id || null,
      archived_at: null,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    };

    setUserVehicles(prev => {
      const updated = [newVeh, ...prev];
      writeStorage(keysRef.current.VEHICLES, updated);
      return updated;
    });

    return newVeh;
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setUserVehicles(prev => {
      const updated = prev.map(v => (v.id === id ? { ...v, ...updates } : v));
      writeStorage(keysRef.current.VEHICLES, updated);
      return updated;
    });
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setUserVehicles(prev => {
      const updated = prev.filter(v => v.id !== id);
      writeStorage(keysRef.current.VEHICLES, updated);
      return updated;
    });
  }, []);

  const addDriver = useCallback((data: Partial<Driver>): Driver => {
    const newDriver: Driver = {
      id: `drv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      user_id: null,
      role_type: data.role_type || 'driver',
      full_name: data.full_name || '',
      phone: data.phone || '',
      licence_number_enc: data.licence_number_enc || null,
      licence_class: data.licence_class || 'C',
      licence_expiry: data.licence_expiry || null,
      status: data.status || 'active',
      emergency_contact: data.emergency_contact || null,
      sms_consent_given: data.sms_consent_given ?? true,
      sms_consent_at: data.sms_consent_given ? new Date().toISOString() : null,
      location_consent_given: data.location_consent_given ?? true,
      location_consent_at: data.location_consent_given ? new Date().toISOString() : null,
      archived_at: null,
    };

    setUserDrivers(prev => {
      const updated = [newDriver, ...prev];
      writeStorage(keysRef.current.DRIVERS, updated);
      return updated;
    });

    return newDriver;
  }, []);

  const addLedgerEntry = useCallback((data: Partial<LedgerEntry>): LedgerEntry => {
    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      driver_id: data.driver_id || null,
      trip_id: null,
      entry_type: data.entry_type || 'income',
      category: data.category || 'daily_sales',
      amount_pesewas: data.amount_pesewas || 0,
      payment_method: data.payment_method || 'cash',
      reference: data.reference || null,
      status: 'confirmed',
      voided_by_entry_id: null,
      void_reason: null,
      recorded_by: 'usr-current',
      idempotency_key: `key-${Date.now()}`,
      notes: data.notes || '',
      entry_date: data.entry_date || new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    };

    setUserLedger(prev => {
      const updated = [newEntry, ...prev];
      writeStorage(keysRef.current.LEDGER, updated);
      return updated;
    });

    return newEntry;
  }, []);

  const voidLedgerEntry = useCallback((id: string, reason: string) => {
    setUserLedger(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, status: 'voided' as const, void_reason: reason } : e
      );
      writeStorage(keysRef.current.LEDGER, updated);
      return updated;
    });
  }, []);

  const addMaintenanceRecord = useCallback((data: Partial<MaintenanceRecord>): MaintenanceRecord => {
    const newRecord: MaintenanceRecord = {
      id: `mnt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      schedule_id: data.schedule_id || null,
      description: data.description || '',
      cost_pesewas: data.cost_pesewas || 0,
      workshop: data.workshop || null,
      performed_on: data.performed_on || new Date().toISOString().slice(0, 10),
      odometer_km: data.odometer_km || null,
      ledger_entry_id: data.ledger_entry_id || null,
    };

    setUserMaintenance(prev => {
      const updated = [newRecord, ...prev];
      writeStorage(keysRef.current.MAINTENANCE, updated);
      return updated;
    });

    return newRecord;
  }, []);

  const addDocument = useCallback((data: Partial<VehicleDocument>): VehicleDocument => {
    const expiresOn = data.expires_on || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const daysUntilExpiry = Math.ceil((new Date(expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const veh = userVehicles.find(v => v.id === data.vehicle_id);

    const newDoc: VehicleDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      doc_type: data.doc_type || 'insurance',
      doc_number: data.doc_number || null,
      issued_on: data.issued_on || null,
      expires_on: expiresOn,
      file_url: data.file_url || null,
      days_until_expiry: daysUntilExpiry,
      vehicle: veh,
    };

    setUserDocuments(prev => {
      const updated = [newDoc, ...prev];
      writeStorage(keysRef.current.DOCUMENTS, updated);
      return updated;
    });

    return newDoc;
  }, [userVehicles]);

  const addIncident = useCallback((data: Partial<Incident>): Incident => {
    const veh = userVehicles.find(v => v.id === data.vehicle_id);
    const drv = userDrivers.find(d => d.id === data.driver_id);

    const newIncident: Incident = {
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      driver_id: data.driver_id || null,
      incident_type: data.incident_type || 'breakdown',
      severity: data.severity || 'medium',
      description: data.description || '',
      location_text: data.location_text || null,
      reported_by: 'Fleet Manager',
      reported_at: new Date().toISOString(),
      status: data.status || 'open',
      resolved_at: null,
      resolution_notes: null,
      vehicle: veh,
      driver: drv,
    };

    setUserIncidents(prev => {
      const updated = [newIncident, ...prev];
      writeStorage(keysRef.current.INCIDENTS, updated);
      return updated;
    });

    return newIncident;
  }, [userVehicles, userDrivers]);

  const addFuelLog = useCallback((data: Partial<FuelLog>): FuelLog => {
    const veh = userVehicles.find(v => v.id === data.vehicle_id);
    const drv = userDrivers.find(d => d.id === data.driver_id);

    const newLog: FuelLog = {
      id: `fuel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      driver_id: data.driver_id || null,
      filled_on: data.filled_on || new Date().toISOString().slice(0, 10),
      litres: data.litres || 0,
      amount_pesewas: data.amount_pesewas || 0,
      odometer_km: data.odometer_km || null,
      station: data.station || null,
      ledger_entry_id: null,
      vehicle: veh,
      driver: drv,
    };

    setUserFuel(prev => {
      const updated = [newLog, ...prev];
      writeStorage(keysRef.current.FUEL, updated);
      return updated;
    });

    return newLog;
  }, [userVehicles, userDrivers]);

  const addTrip = useCallback((data: Partial<Trip>): Trip => {
    const veh = userVehicles.find(v => v.id === data.vehicle_id);
    const drv = userDrivers.find(d => d.id === data.driver_id);

    const newTrip: Trip = {
      id: `trip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      org_id: 'org-user',
      vehicle_id: data.vehicle_id || '',
      driver_id: data.driver_id || '',
      route_label: data.route_label || 'Local Run',
      started_at: data.started_at || new Date().toISOString(),
      ended_at: data.ended_at || null,
      start_odometer_km: data.start_odometer_km || null,
      end_odometer_km: data.end_odometer_km || null,
      status: data.status || 'in_progress',
      notes: data.notes || null,
      vehicle: veh,
      driver: drv,
    };

    setUserTrips(prev => {
      const updated = [newTrip, ...prev];
      writeStorage(keysRef.current.TRIPS, updated);
      return updated;
    });

    return newTrip;
  }, [userVehicles, userDrivers]);

  // Completely wipe all local data for fresh sign-ups
  const resetToCleanState = useCallback(() => {
    setOrgNameState('');
    setUserVehicles([]);
    setUserDrivers([]);
    setUserLedger([]);
    setUserMaintenance([]);
    setUserSchedules([]);
    setUserDocuments([]);
    setUserIncidents([]);
    setUserFuel([]);
    setUserTrips([]);
    setUserNotifications([]);

    if (typeof window !== 'undefined') {
      Object.values(keysRef.current).forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });
    }
  }, []);

  const clearAllData = resetToCleanState;

  // Active data values depending on Demo vs Clean User
  const vehicles = isDemo ? mockVehicles : userVehicles;
  const drivers = isDemo ? mockDrivers : userDrivers;
  const ledgerEntries = isDemo ? mockLedgerEntries : userLedger;
  const maintenanceRecords = isDemo ? mockMaintenanceRecords : userMaintenance;
  const maintenanceSchedules = isDemo ? mockMaintenanceSchedules : userSchedules;
  const documents = isDemo ? mockDocuments : userDocuments;
  const incidents = isDemo ? mockIncidents : userIncidents;
  const fuelLogs = isDemo ? mockFuelLogs : userFuel;
  const trips = isDemo ? mockTrips : userTrips;
  const notifications = isDemo ? mockNotifications : userNotifications;

  // Real-time calculated stats
  const stats = useMemo<FleetStats>(() => {
    if (isDemo) return mockFleetStats;

    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const validEntries = userLedger.filter(e => e.status !== 'voided');

    const todayIncome = validEntries
      .filter(e => e.entry_type === 'income' && e.entry_date === todayStr)
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    const todayExpenses = validEntries
      .filter(e => e.entry_type === 'expense' && e.entry_date === todayStr)
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    const monthIncome = validEntries
      .filter(e => e.entry_type === 'income' && e.entry_date.startsWith(thisMonthStr))
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    const monthExpenses = validEntries
      .filter(e => e.entry_type === 'expense' && e.entry_date.startsWith(thisMonthStr))
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const weekIncome = validEntries
      .filter(e => e.entry_type === 'income' && e.entry_date >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    const weekExpenses = validEntries
      .filter(e => e.entry_type === 'expense' && e.entry_date >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.amount_pesewas, 0);

    return {
      today_income_pesewas: todayIncome,
      today_expenses_pesewas: todayExpenses,
      this_week_income_pesewas: weekIncome,
      this_week_expenses_pesewas: weekExpenses,
      this_month_income_pesewas: monthIncome,
      this_month_expenses_pesewas: monthExpenses,
      active: userVehicles.filter(v => v.status === 'active').length,
      idle: userVehicles.filter(v => v.status === 'idle').length,
      maintenance: userVehicles.filter(v => v.status === 'maintenance').length,
      unavailable: userVehicles.filter(v => v.status === 'unavailable').length,
      total_vehicles: userVehicles.length,
      active_drivers: userDrivers.filter(d => d.status === 'active').length,
      total_drivers: userDrivers.length,
      docs_expiring_soon: userDocuments.filter(d => (d.days_until_expiry ?? 999) <= 30).length,
      maintenance_overdue: userSchedules.filter(s => s.next_due_on && new Date(s.next_due_on).getTime() < Date.now()).length,
      open_incidents: userIncidents.filter(i => i.status !== 'resolved').length,
    };
  }, [isDemo, userVehicles, userDrivers, userLedger, userDocuments, userSchedules, userIncidents]);

  const value = useMemo(
    () => ({
      isDemo,
      mounted,
      orgName: isDemo ? 'Accra Urban Transit Fleet' : (orgName || 'My Fleet'),
      setOrgName,
      vehicles,
      drivers,
      ledgerEntries,
      maintenanceRecords,
      maintenanceSchedules,
      documents,
      incidents,
      fuelLogs,
      trips,
      notifications,
      stats,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addDriver,
      addLedgerEntry,
      voidLedgerEntry,
      addMaintenanceRecord,
      addDocument,
      addIncident,
      addFuelLog,
      addTrip,
      clearAllData,
      resetToCleanState,
    }),
    [
      isDemo,
      mounted,
      orgName,
      setOrgName,
      vehicles,
      drivers,
      ledgerEntries,
      maintenanceRecords,
      maintenanceSchedules,
      documents,
      incidents,
      fuelLogs,
      trips,
      notifications,
      stats,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addDriver,
      addLedgerEntry,
      voidLedgerEntry,
      addMaintenanceRecord,
      addDocument,
      addIncident,
      addFuelLog,
      addTrip,
      clearAllData,
      resetToCleanState,
    ]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const ctx = useContext(FleetContext);
  if (!ctx) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return ctx;
}
