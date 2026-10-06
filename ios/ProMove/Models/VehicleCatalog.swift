//
//  VehicleCatalog.swift
//  ProMove Fleet
//
//  Ghana Curated Commercial Vehicle Catalog
//  Comprehensive makes and models tailored for:
//  - Trotros (Minibuses)
//  - Taxis & Ride-Hailing Saloons
//  - Intercity Buses & Coaches
//  - Haulage Trucks, Tippers & Flatbeds
//  - Delivery Vans & Light Commercials
//

import Foundation

public struct VehicleCatalogModel: Identifiable, Hashable {
    public let id: String
    public let name: String
    public let types: [VehicleType]
    
    public init(name: String, types: [VehicleType] = [.trotro]) {
        self.id = name
        self.name = name
        self.types = types
    }
}

public struct VehicleCatalogMake: Identifiable, Hashable {
    public let id: String
    public let make: String
    public let popularTypes: [VehicleType]
    public let models: [VehicleCatalogModel]
    
    public init(make: String, popularTypes: [VehicleType], models: [VehicleCatalogModel]) {
        self.id = make
        self.make = make
        self.popularTypes = popularTypes
        self.models = models
    }
}

public enum CuratedVehicleCatalog {
    public static let makes: [VehicleCatalogMake] = [
        VehicleCatalogMake(
            make: "Toyota",
            popularTypes: [.trotro, .taxi, .bus, .truck, .pickup],
            models: [
                VehicleCatalogModel(name: "HiAce (Commuter / 15-Seater)", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "HiAce (GL / High Roof)", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "TownAce", types: [.trotro, .other]),
                VehicleCatalogModel(name: "LiteAce", types: [.trotro, .other]),
                VehicleCatalogModel(name: "Coaster (30-Seater)", types: [.bus, .trotro]),
                VehicleCatalogModel(name: "Corolla", types: [.taxi]),
                VehicleCatalogModel(name: "Yaris", types: [.taxi]),
                VehicleCatalogModel(name: "Vitz", types: [.taxi]),
                VehicleCatalogModel(name: "Camry", types: [.taxi]),
                VehicleCatalogModel(name: "Prius", types: [.taxi]),
                VehicleCatalogModel(name: "Passo", types: [.taxi]),
                VehicleCatalogModel(name: "Belta", types: [.taxi]),
                VehicleCatalogModel(name: "Probox", types: [.other, .taxi]),
                VehicleCatalogModel(name: "Succeed", types: [.other]),
                VehicleCatalogModel(name: "Hilux", types: [.truck, .pickup]),
                VehicleCatalogModel(name: "Dyna", types: [.truck]),
                VehicleCatalogModel(name: "ToyoAce", types: [.truck]),
                VehicleCatalogModel(name: "Land Cruiser Pickup", types: [.truck, .pickup])
            ]
        ),
        VehicleCatalogMake(
            make: "Hyundai",
            popularTypes: [.taxi, .trotro, .bus, .truck],
            models: [
                VehicleCatalogModel(name: "i10 / Grand i10", types: [.taxi]),
                VehicleCatalogModel(name: "Accent", types: [.taxi]),
                VehicleCatalogModel(name: "Elantra", types: [.taxi]),
                VehicleCatalogModel(name: "Atos", types: [.taxi]),
                VehicleCatalogModel(name: "Getz", types: [.taxi]),
                VehicleCatalogModel(name: "H-100 / Grace", types: [.trotro, .other, .truck]),
                VehicleCatalogModel(name: "Porter II", types: [.truck, .other]),
                VehicleCatalogModel(name: "Starex / H-1", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "County", types: [.bus, .trotro]),
                VehicleCatalogModel(name: "Universe (Intercity)", types: [.bus])
            ]
        ),
        VehicleCatalogMake(
            make: "Mercedes-Benz",
            popularTypes: [.trotro, .bus, .truck],
            models: [
                VehicleCatalogModel(name: "Sprinter 208D / 312D / 313 (T1N)", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "Sprinter 314 / 316 / 515 (NCV3)", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "Sprinter 519 (22-Seater)", types: [.bus, .trotro]),
                VehicleCatalogModel(name: "Vario 614D / 814D", types: [.bus, .trotro]),
                VehicleCatalogModel(name: "207D / 307D / 308D (Classic Trotro)", types: [.trotro]),
                VehicleCatalogModel(name: "Actros (Tipper / Haulage)", types: [.truck]),
                VehicleCatalogModel(name: "Atego (Medium Haulage)", types: [.truck]),
                VehicleCatalogModel(name: "Axor", types: [.truck])
            ]
        ),
        VehicleCatalogMake(
            make: "Nissan",
            popularTypes: [.trotro, .taxi, .truck, .pickup],
            models: [
                VehicleCatalogModel(name: "Urvan / Caravan", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "NV350 Urvan", types: [.trotro, .bus]),
                VehicleCatalogModel(name: "Civilian", types: [.bus]),
                VehicleCatalogModel(name: "Versa / Latio", types: [.taxi]),
                VehicleCatalogModel(name: "Sentra / Sunny", types: [.taxi]),
                VehicleCatalogModel(name: "March / Micra", types: [.taxi]),
                VehicleCatalogModel(name: "Tiida", types: [.taxi]),
                VehicleCatalogModel(name: "Hardbody / Navara", types: [.pickup, .truck]),
                VehicleCatalogModel(name: "Atlas / Cabstar", types: [.truck])
            ]
        ),
        VehicleCatalogMake(
            make: "Kia",
            popularTypes: [.taxi, .trotro, .truck],
            models: [
                VehicleCatalogModel(name: "Picanto / Morning", types: [.taxi]),
                VehicleCatalogModel(name: "Rio", types: [.taxi]),
                VehicleCatalogModel(name: "Forte / Cerato", types: [.taxi]),
                VehicleCatalogModel(name: "Bongo III (K2700 / K2500)", types: [.truck, .other]),
                VehicleCatalogModel(name: "Pregio", types: [.trotro]),
                VehicleCatalogModel(name: "Granbird", types: [.bus])
            ]
        ),
        VehicleCatalogMake(
            make: "Suzuki",
            popularTypes: [.taxi, .other],
            models: [
                VehicleCatalogModel(name: "Alto / 800", types: [.taxi]),
                VehicleCatalogModel(name: "Swift / Dzire", types: [.taxi]),
                VehicleCatalogModel(name: "Super Carry (Aboboyaa / Delivery)", types: [.other, .truck]),
                VehicleCatalogModel(name: "Every / APV Van", types: [.other, .trotro]),
                VehicleCatalogModel(name: "S-Presso", types: [.taxi])
            ]
        ),
        VehicleCatalogMake(
            make: "Sinotruk HOWO",
            popularTypes: [.truck],
            models: [
                VehicleCatalogModel(name: "HOWO 371 Tipper (10-Wheeler / Quarry)", types: [.truck]),
                VehicleCatalogModel(name: "HOWO A7 Tractor Unit", types: [.truck]),
                VehicleCatalogModel(name: "HOWO T5G Flatbed / Dropside", types: [.truck]),
                VehicleCatalogModel(name: "HOWO Concrete Mixer", types: [.truck])
            ]
        ),
        VehicleCatalogMake(
            make: "DAF",
            popularTypes: [.truck],
            models: [
                VehicleCatalogModel(name: "CF 75 / 85 Tipper & Flatbed", types: [.truck]),
                VehicleCatalogModel(name: "XF 95 / 105 Haulage Articulator", types: [.truck]),
                VehicleCatalogModel(name: "LF 45 / 55 Distribution Truck", types: [.truck])
            ]
        ),
        VehicleCatalogMake(
            make: "Scania",
            popularTypes: [.bus, .truck],
            models: [
                VehicleCatalogModel(name: "Marcopolo VIP IV (VIP Jeoun Bus)", types: [.bus]),
                VehicleCatalogModel(name: "Touring Coach", types: [.bus]),
                VehicleCatalogModel(name: "P-Series / G-Series Tipper", types: [.truck]),
                VehicleCatalogModel(name: "R-Series Heavy Haulage", types: [.truck])
            ]
        ),
        VehicleCatalogMake(
            make: "Daewoo",
            popularTypes: [.taxi, .bus],
            models: [
                VehicleCatalogModel(name: "Matiz", types: [.taxi]),
                VehicleCatalogModel(name: "Kalos / Gentra", types: [.taxi]),
                VehicleCatalogModel(name: "BH120 / Royale Coach", types: [.bus])
            ]
        ),
        VehicleCatalogMake(
            make: "Piaggio / TVS / Bajaj",
            popularTypes: [.other],
            models: [
                VehicleCatalogModel(name: "Piaggio Ape Cargo (Delivery Tricycle)", types: [.other]),
                VehicleCatalogModel(name: "TVS King Deluxe (Pragya / Tricycle)", types: [.other]),
                VehicleCatalogModel(name: "Bajaj Maxima Z Cargo", types: [.other])
            ]
        )
    ]
}
