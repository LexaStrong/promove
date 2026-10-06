//
//  Vehicle.swift
//  ProMove Fleet
//
//  Ghana Commercial Vehicle Domain Model
//

import Foundation

public enum VehicleType: String, Codable, CaseIterable, Identifiable {
    case trotro = "trotro"
    case taxi = "taxi"
    case bus = "bus"
    case truck = "truck"
    case pickup = "pickup"
    case other = "other"
    
    public var id: String { rawValue }
    
    public var displayName: String {
        switch self {
        case .trotro: return "Trotro (Minibus)"
        case .taxi: return "Taxi / Ride Hailing"
        case .bus: return "Intercity Coach / Bus"
        case .truck: return "Haulage / Tipper"
        case .pickup: return "Commercial Pickup"
        case .other: return "Delivery / Other"
        }
    }
}

public enum VehicleStatus: String, Codable, CaseIterable, Identifiable {
    case active = "active"
    case idle = "idle"
    case maintenance = "maintenance"
    case unavailable = "unavailable"
    
    public var id: String { rawValue }
    
    public var displayName: String {
        switch self {
        case .active: return "Active"
        case .idle: return "Idle"
        case .maintenance: return "Maintenance"
        case .unavailable: return "Unavailable"
        }
    }
}

public enum FuelType: String, Codable, CaseIterable, Identifiable {
    case petrol = "petrol"
    case diesel = "diesel"
    case lpg = "lpg"
    case electric = "electric"
    
    public var id: String { rawValue }
    
    public var displayName: String {
        switch self {
        case .petrol: return "Petrol"
        case .diesel: return "Diesel"
        case .lpg: return "Auto-Gas (LPG)"
        case .electric: return "Electric (EV)"
        }
    }
}

public struct Vehicle: Identifiable, Codable, Hashable {
    public let id: String
    public var orgId: String
    public var plateNumber: String
    public var make: String
    public var model: String
    public var year: Int
    public var vehicleType: VehicleType
    public var colour: String?
    public var vin: String?
    public var seats: Int?
    public var fuelType: FuelType
    public var status: VehicleStatus
    public var odometerKm: Double
    public var dailyTargetPesewas: Int?
    public var driverName: String?
    public var driverPhone: String?
    public var lastPingTime: String?
    public var latitude: Double?
    public var longitude: Double?
    public var speedKmh: Double?
    public var heading: Double?
    
    public init(
        id: String = UUID().uuidString,
        orgId: String = "org-accra-1",
        plateNumber: String,
        make: String,
        model: String,
        year: Int = 2020,
        vehicleType: VehicleType = .trotro,
        colour: String? = nil,
        vin: String? = nil,
        seats: Int? = 15,
        fuelType: FuelType = .diesel,
        status: VehicleStatus = .active,
        odometerKm: Double = 0.0,
        dailyTargetPesewas: Int? = 35000,
        driverName: String? = nil,
        driverPhone: String? = nil,
        lastPingTime: String? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil,
        speedKmh: Double? = nil,
        heading: Double? = nil
    ) {
        self.id = id
        self.orgId = orgId
        self.plateNumber = plateNumber
        self.make = make
        self.model = model
        self.year = year
        self.vehicleType = vehicleType
        self.colour = colour
        self.vin = vin
        self.seats = seats
        self.fuelType = fuelType
        self.status = status
        self.odometerKm = odometerKm
        self.dailyTargetPesewas = dailyTargetPesewas
        self.driverName = driverName
        self.driverPhone = driverPhone
        self.lastPingTime = lastPingTime
        self.latitude = latitude
        self.longitude = longitude
        self.speedKmh = speedKmh
        self.heading = heading
    }
    
    /// Formatted daily target in Ghana Cedis
    public var dailyTargetCedisString: String {
        guard let pesewas = dailyTargetPesewas else { return "GH₵ 0.00" }
        let cedis = Double(pesewas) / 100.0
        return String(format: "GH₵ %.2f", cedis)
    }
}
