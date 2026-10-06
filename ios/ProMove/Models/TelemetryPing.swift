//
//  TelemetryPing.swift
//  ProMove Fleet
//
//  Payload sent to /api/gps/telemetry from iOS Driver Mode
//

import Foundation

public struct TelemetryPing: Codable {
    public let vehicleId: String
    public let plateNumber: String
    public let driverName: String
    public let latitude: Double
    public let longitude: Double
    public let altitudeMeters: Double?
    public let speedKmh: Double
    public let courseHeading: Double?
    public let batteryPercentage: Int?
    public let ignition: Bool
    public let timestamp: String
    
    public init(
        vehicleId: String,
        plateNumber: String,
        driverName: String,
        latitude: Double,
        longitude: Double,
        altitudeMeters: Double? = nil,
        speedKmh: Double = 0.0,
        courseHeading: Double? = nil,
        batteryPercentage: Int? = nil,
        ignition: Bool = true,
        timestamp: String = ISO8601DateFormatter().string(from: Date())
    ) {
        self.vehicleId = vehicleId
        self.plateNumber = plateNumber
        self.driverName = driverName
        self.latitude = latitude
        self.longitude = longitude
        self.altitudeMeters = altitudeMeters
        self.speedKmh = speedKmh
        self.courseHeading = courseHeading
        self.batteryPercentage = batteryPercentage
        self.ignition = ignition
        self.timestamp = timestamp
    }
}

public struct TelemetryResponse: Codable {
    public let success: Bool
    public let position: FleetPosition?
    public let alerts: [FleetAlert]?
    public let error: String?
}

public struct FleetPosition: Identifiable, Codable, Hashable {
    public var id: String { vehicleId }
    public let vehicleId: String
    public let plateNumber: String
    public let driverName: String?
    public let latitude: Double
    public let longitude: Double
    public let altitudeMeters: Double?
    public let speedKmh: Double
    public let courseHeading: Double?
    public let batteryPercentage: Int?
    public let ignition: Bool
    public let timestamp: String
    
    public var isMoving: Bool {
        speedKmh > 3.0
    }
}

public struct FleetAlert: Identifiable, Codable, Hashable {
    public let id: String
    public let vehicleId: String
    public let plateNumber: String
    public let alertType: String
    public let severity: String
    public let message: String
    public let timestamp: String
}

public struct PositionsApiResponse: Codable {
    public let success: Bool
    public let timestamp: String
    public let count: Int
    public let positions: [FleetPosition]
    public let alerts: [FleetAlert]?
}

public struct FleetStats: Codable {
    public var totalVehicles: Int
    public var active: Int
    public var idle: Int
    public var maintenance: Int
    public var unavailable: Int
    public var activeDrivers: Int
    public var openIncidents: Int
    
    public init(
        totalVehicles: Int = 0,
        active: Int = 0,
        idle: Int = 0,
        maintenance: Int = 0,
        unavailable: Int = 0,
        activeDrivers: Int = 0,
        openIncidents: Int = 0
    ) {
        self.totalVehicles = totalVehicles
        self.active = active
        self.idle = idle
        self.maintenance = maintenance
        self.unavailable = unavailable
        self.activeDrivers = activeDrivers
        self.openIncidents = openIncidents
    }
}
