// ─────────────────────────────────────────────────────────
// ProMove Curated Vehicle Catalog for Ghana Commercial Fleet
// Comprehensive makes and models popular across:
// - Trotros (Minibuses)
// - Taxis & Ride-Hailing Saloons
// - Intercity Buses & Coaches
// - Haulage Trucks, Tippers & Flatbeds
// - Delivery Vans & Light Commercials
// ─────────────────────────────────────────────────────────

export interface VehicleCatalogModel {
  name: string;
  types?: string[];
}

export interface VehicleCatalogMake {
  make: string;
  popularTypes: string[];
  models: VehicleCatalogModel[];
}

export const CURATED_VEHICLE_CATALOG: VehicleCatalogMake[] = [
  {
    make: 'Toyota',
    popularTypes: ['trotro', 'taxi', 'bus', 'hauling', 'delivery', 'pickup'],
    models: [
      { name: 'HiAce (Commuter / 15-Seater)', types: ['trotro', 'bus', 'delivery'] },
      { name: 'HiAce (GL / High Roof)', types: ['trotro', 'bus'] },
      { name: 'TownAce', types: ['trotro', 'delivery'] },
      { name: 'LiteAce', types: ['trotro', 'delivery'] },
      { name: 'Coaster (30-Seater)', types: ['bus', 'trotro'] },
      { name: 'Corolla', types: ['taxi'] },
      { name: 'Yaris', types: ['taxi'] },
      { name: 'Vitz', types: ['taxi'] },
      { name: 'Camry', types: ['taxi'] },
      { name: 'Prius', types: ['taxi'] },
      { name: 'Passo', types: ['taxi'] },
      { name: 'Belta', types: ['taxi'] },
      { name: 'Probox', types: ['delivery', 'taxi'] },
      { name: 'Succeed', types: ['delivery'] },
      { name: 'Hilux', types: ['hauling', 'pickup'] },
      { name: 'Dyna', types: ['hauling'] },
      { name: 'ToyoAce', types: ['hauling'] },
      { name: 'Land Cruiser Pickup', types: ['hauling', 'pickup'] },
    ],
  },
  {
    make: 'Hyundai',
    popularTypes: ['taxi', 'trotro', 'bus', 'hauling', 'delivery'],
    models: [
      { name: 'i10 / Grand i10', types: ['taxi'] },
      { name: 'Accent', types: ['taxi'] },
      { name: 'Elantra', types: ['taxi'] },
      { name: 'Atos', types: ['taxi'] },
      { name: 'Getz', types: ['taxi'] },
      { name: 'H-100 / Grace', types: ['trotro', 'delivery', 'hauling'] },
      { name: 'Porter II', types: ['hauling', 'delivery'] },
      { name: 'Starex / H-1', types: ['trotro', 'bus'] },
      { name: 'County', types: ['bus', 'trotro'] },
      { name: 'Universe (Intercity)', types: ['bus'] },
      { name: 'Aero Town', types: ['bus'] },
      { name: 'HD65 / HD72 / HD78', types: ['hauling'] },
      { name: 'Mighty', types: ['hauling'] },
    ],
  },
  {
    make: 'Mercedes-Benz',
    popularTypes: ['trotro', 'bus', 'hauling', 'delivery'],
    models: [
      { name: 'Sprinter (311 / 313 / 315 / 416)', types: ['trotro', 'bus'] },
      { name: 'Sprinter 208D', types: ['trotro'] },
      { name: '207D / 307D (Standard Trotro)', types: ['trotro'] },
      { name: 'MB100', types: ['trotro'] },
      { name: 'Vito', types: ['delivery', 'trotro'] },
      { name: 'Tourismo Coach', types: ['bus'] },
      { name: 'Travego', types: ['bus'] },
      { name: 'O404 / Conecto', types: ['bus'] },
      { name: 'Actros (6x4 / 8x4 Tipper)', types: ['hauling'] },
      { name: 'Axor', types: ['hauling'] },
      { name: 'Atego', types: ['hauling'] },
      { name: 'Vario', types: ['bus', 'trotro'] },
    ],
  },
  {
    make: 'Kia',
    popularTypes: ['taxi', 'hauling', 'delivery', 'trotro'],
    models: [
      { name: 'Picanto', types: ['taxi'] },
      { name: 'Morning', types: ['taxi'] },
      { name: 'Rio', types: ['taxi'] },
      { name: 'Cerato', types: ['taxi'] },
      { name: 'Bongo III / K2700', types: ['hauling', 'delivery'] },
      { name: 'K3000 / Frontier', types: ['hauling'] },
      { name: 'Pregio', types: ['trotro'] },
      { name: 'Carnival', types: ['bus', 'trotro'] },
      { name: 'Granbird (Coach)', types: ['bus'] },
    ],
  },
  {
    make: 'Nissan',
    popularTypes: ['trotro', 'taxi', 'delivery', 'hauling', 'bus'],
    models: [
      { name: 'Urvan / Caravan', types: ['trotro', 'delivery'] },
      { name: 'NV350 Caravan', types: ['trotro', 'delivery'] },
      { name: 'Almera', types: ['taxi'] },
      { name: 'Micra / March', types: ['taxi'] },
      { name: 'Sentra', types: ['taxi'] },
      { name: 'Versa', types: ['taxi'] },
      { name: 'Civilian (Bus)', types: ['bus', 'trotro'] },
      { name: 'NV200', types: ['delivery'] },
      { name: 'AD Van', types: ['delivery'] },
      { name: 'Hardbody / Navara', types: ['hauling', 'pickup'] },
      { name: 'Cabstar', types: ['hauling'] },
    ],
  },
  {
    make: 'Suzuki',
    popularTypes: ['delivery', 'taxi', 'hauling'],
    models: [
      { name: 'Super Carry', types: ['delivery', 'hauling'] },
      { name: 'Carry Pick-up', types: ['delivery', 'hauling'] },
      { name: 'Alto', types: ['taxi'] },
      { name: 'Dzire', types: ['taxi'] },
      { name: 'Swift', types: ['taxi'] },
      { name: 'S-Presso', types: ['taxi'] },
      { name: 'Celerio', types: ['taxi'] },
      { name: 'Every Van', types: ['delivery'] },
    ],
  },
  {
    make: 'Ford',
    popularTypes: ['trotro', 'delivery', 'hauling'],
    models: [
      { name: 'Transit (15 / 17 Seater)', types: ['trotro', 'bus'] },
      { name: 'Transit Custom', types: ['delivery'] },
      { name: 'Transit Connect', types: ['delivery'] },
      { name: 'Ranger', types: ['hauling', 'pickup'] },
      { name: 'F-150 / F-250', types: ['hauling'] },
    ],
  },
  {
    make: 'Volkswagen',
    popularTypes: ['trotro', 'delivery', 'taxi', 'bus'],
    models: [
      { name: 'Crafter', types: ['trotro', 'bus'] },
      { name: 'Transporter (T4 / T5 / T6)', types: ['trotro', 'delivery'] },
      { name: 'LT 28 / LT 35', types: ['trotro'] },
      { name: 'Caddy', types: ['delivery'] },
      { name: 'Polo', types: ['taxi'] },
      { name: 'Golf', types: ['taxi'] },
    ],
  },
  {
    make: 'Isuzu',
    popularTypes: ['hauling', 'delivery', 'bus'],
    models: [
      { name: 'N-Series / Elf', types: ['hauling'] },
      { name: 'Forward', types: ['hauling'] },
      { name: 'F-Series', types: ['hauling'] },
      { name: 'Giga Tipper', types: ['hauling'] },
      { name: 'D-Max', types: ['hauling', 'pickup'] },
      { name: 'Journey (Coach)', types: ['bus'] },
    ],
  },
  {
    make: 'Mitsubishi Fuso',
    popularTypes: ['hauling', 'bus', 'trotro'],
    models: [
      { name: 'Canter (FE / FG Series)', types: ['hauling', 'trotro'] },
      { name: 'Fighter', types: ['hauling'] },
      { name: 'Super Great (Heavy Tipper)', types: ['hauling'] },
      { name: 'Rosa (Bus)', types: ['bus', 'trotro'] },
      { name: 'L200', types: ['hauling', 'pickup'] },
    ],
  },
  {
    make: 'HOWO / Sinotruk',
    popularTypes: ['hauling'],
    models: [
      { name: 'Tipper 6x4 (371 HP)', types: ['hauling'] },
      { name: 'A7 Heavy Tractor Head', types: ['hauling'] },
      { name: 'HOWO 7 Dump Truck', types: ['hauling'] },
      { name: 'HOWO TX', types: ['hauling'] },
      { name: 'T5G Cargo Truck', types: ['hauling'] },
    ],
  },
  {
    make: 'Yutong',
    popularTypes: ['bus'],
    models: [
      { name: 'ZK6122 High Coach', types: ['bus'] },
      { name: 'ZK6118 Intercity Coach', types: ['bus'] },
      { name: 'ZK6858 Medium Bus', types: ['bus'] },
      { name: 'Master Coach', types: ['bus'] },
    ],
  },
  {
    make: 'Scania',
    popularTypes: ['hauling', 'bus'],
    models: [
      { name: 'R-Series (R420 / R440)', types: ['hauling'] },
      { name: 'G-Series (G420)', types: ['hauling'] },
      { name: 'P-Series (P380 Tipper)', types: ['hauling'] },
      { name: 'Marcopolo Touring Coach', types: ['bus'] },
      { name: 'K-Series Intercity', types: ['bus'] },
    ],
  },
  {
    make: 'DAF',
    popularTypes: ['hauling'],
    models: [
      { name: 'XF 105 (Tractor Head)', types: ['hauling'] },
      { name: 'CF 85 (Tipper / Flatbed)', types: ['hauling'] },
      { name: 'LF 45 / 55 (Rigid Truck)', types: ['hauling'] },
    ],
  },
  {
    make: 'Iveco',
    popularTypes: ['hauling', 'delivery', 'trotro'],
    models: [
      { name: 'Daily (Van / Minibus)', types: ['trotro', 'delivery', 'hauling'] },
      { name: 'Eurocargo', types: ['hauling'] },
      { name: 'Trakker (Tipper)', types: ['hauling'] },
      { name: 'Stralis', types: ['hauling'] },
    ],
  },
  {
    make: 'MAN',
    popularTypes: ['hauling', 'bus'],
    models: [
      { name: 'TGA / TGS (Tipper / Hauler)', types: ['hauling'] },
      { name: 'TGX Tractor Head', types: ['hauling'] },
      { name: 'CLA 26.280 Dump Truck', types: ['hauling'] },
      { name: 'Lion’s Coach', types: ['bus'] },
    ],
  },
  {
    make: 'Volvo',
    popularTypes: ['hauling', 'bus'],
    models: [
      { name: 'FH12 / FH16 Heavy Tractor', types: ['hauling'] },
      { name: 'FM / FMX Tipper', types: ['hauling'] },
      { name: '9700 Luxury Coach', types: ['bus'] },
    ],
  },
  {
    make: 'Shacman',
    popularTypes: ['hauling'],
    models: [
      { name: 'F3000 Tipper (6x4 / 8x4)', types: ['hauling'] },
      { name: 'X3000 Tractor Head', types: ['hauling'] },
      { name: 'L3000 Cargo Truck', types: ['hauling'] },
    ],
  },
  {
    make: 'King Long',
    popularTypes: ['bus', 'trotro'],
    models: [
      { name: 'XMQ6127 Luxury Coach', types: ['bus'] },
      { name: 'Kingo Minibus', types: ['trotro', 'bus'] },
    ],
  },
  {
    make: 'Daewoo',
    popularTypes: ['taxi', 'delivery', 'hauling', 'bus'],
    models: [
      { name: 'Matiz', types: ['taxi'] },
      { name: 'Damas', types: ['delivery'] },
      { name: 'Novus Tipper', types: ['hauling'] },
      { name: 'Royale Coach', types: ['bus'] },
    ],
  },
  {
    make: 'Honda',
    popularTypes: ['taxi'],
    models: [
      { name: 'Fit / Jazz', types: ['taxi'] },
      { name: 'Civic', types: ['taxi'] },
      { name: 'City', types: ['taxi'] },
      { name: 'Accord', types: ['taxi'] },
    ],
  },
  {
    make: 'Renault',
    popularTypes: ['trotro', 'delivery', 'hauling'],
    models: [
      { name: 'Master Van', types: ['trotro', 'delivery'] },
      { name: 'Kangoo', types: ['delivery'] },
      { name: 'Trafic', types: ['delivery', 'trotro'] },
      { name: 'Kerax Heavy Tipper', types: ['hauling'] },
    ],
  },
  {
    make: 'Peugeot',
    popularTypes: ['delivery', 'trotro'],
    models: [
      { name: 'Boxer', types: ['trotro', 'delivery'] },
      { name: 'Partner', types: ['delivery'] },
      { name: 'Expert', types: ['delivery'] },
    ],
  },
  {
    make: 'Bajaj / Piaggio',
    popularTypes: ['delivery'],
    models: [
      { name: 'Maxima Cargo (Tricycle)', types: ['delivery'] },
      { name: 'Ape City / Cargo', types: ['delivery'] },
    ],
  },
];

/**
 * Returns a list of make names, optionally sorted with makes popular
 * for the specified vehicle type placed first.
 */
export function getCuratedMakes(vehicleType?: string): string[] {
  const allMakes = CURATED_VEHICLE_CATALOG.map(c => c.make);
  if (!vehicleType) return allMakes;

  const type = vehicleType.toLowerCase();
  const prioritized = CURATED_VEHICLE_CATALOG
    .filter(c => c.popularTypes.includes(type))
    .map(c => c.make);

  const others = allMakes.filter(m => !prioritized.includes(m));
  return [...prioritized, ...others];
}

/**
 * Returns models for a given make, with models suited for the given
 * vehicle type appearing first.
 */
export function getCuratedModels(make: string, vehicleType?: string): string[] {
  const entry = CURATED_VEHICLE_CATALOG.find(
    c => c.make.toLowerCase() === make.trim().toLowerCase()
  );
  if (!entry) return [];

  if (!vehicleType) {
    return entry.models.map(m => m.name);
  }

  const type = vehicleType.toLowerCase();
  const matching = entry.models
    .filter(m => !m.types || m.types.includes(type))
    .map(m => m.name);

  const others = entry.models
    .filter(m => m.types && !m.types.includes(type))
    .map(m => m.name);

  return [...matching, ...others];
}

/**
 * Default make and model recommendations per vehicle type.
 */
export const DEFAULT_VEHICLE_PRESETS: Record<string, { make: string; model: string }> = {
  trotro: { make: 'Toyota', model: 'HiAce (Commuter / 15-Seater)' },
  taxi: { make: 'Hyundai', model: 'i10 / Grand i10' },
  bus: { make: 'Mercedes-Benz', model: 'Sprinter (311 / 313 / 315 / 416)' },
  hauling: { make: 'Kia', model: 'Bongo III / K2700' },
  truck: { make: 'HOWO / Sinotruk', model: 'Tipper 6x4 (371 HP)' },
  delivery: { make: 'Suzuki', model: 'Super Carry' },
  pickup: { make: 'Toyota', model: 'Hilux' },
  other: { make: 'Toyota', model: 'HiAce (Commuter / 15-Seater)' },
};
