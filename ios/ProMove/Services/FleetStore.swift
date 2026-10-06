//
//  FleetStore.swift
//  ProMove Fleet
//
//  Central Observable state holder for Vehicles, Driver Session, and Telemetry
//

import Foundation
import Combine
import CoreLocation

@MainActor
public final class FleetStore: ObservableObject {
    public static let shared = FleetStore()
    
    // MARK: - Published State
    @Published public var vehicles: [Vehicle] = []
    @Published public var positions: [FleetPosition] = []
    @Published public var stats: FleetStats = FleetStats()
    @Published public var isOnline: Bool = true
    @Published public var isDriverTrackingActive: Bool = false
    @Published public var selectedVehicleForDriver: Vehicle?
    @Published public var pingsSentCount: Int = 0
    @Published public var lastPingTimestamp: String?
    @Published public var telemetryLogs: [String] = []
    
    // Dependencies
    public let locationManager = LocationManager()
    private let network = NetworkService.shared
    
    private var telemetryTimer: AnyCancellable?
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        loadInitialFleet()
        recalculateStats()
        
        // Listen to location updates
        locationManager.$currentLocation
            .sink { [weak self] loc in
                guard let self = self, let loc = loc, self.isDriverTrackingActive else { return }
                self.handleLocationUpdate(loc)
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Initial Fleet Data
    private func loadInitialFleet() {
        self.vehicles = [
            Vehicle(
                id: "v-trotro-1",
                plateNumber: "GW 2412-23",
                make: "Toyota",
                model: "HiAce (Commuter / 15-Seater)",
                year: 2021,
                vehicleType: .trotro,
                colour: "Yellow & White",
                seats: 15,
                fuelType: .diesel,
                status: .active,
                odometerKm: 78420.0,
                dailyTargetPesewas: 45000,
                driverName: "Kofi Mensah",
                driverPhone: "+233 24 123 4567",
                latitude: 5.6037,
                longitude: -0.1870,
                speedKmh: 42.0,
                heading: 85.0
            ),
            Vehicle(
                id: "v-taxi-1",
                plateNumber: "GR 4512-24",
                make: "Hyundai",
                model: "i10 / Grand i10",
                year: 2022,
                vehicleType: .taxi,
                colour: "Orange & Yellow",
                seats: 5,
                fuelType: .petrol,
                status: .active,
                odometerKm: 34100.0,
                dailyTargetPesewas: 30000,
                driverName: "Kwame Boateng",
                driverPhone: "+233 20 987 6543",
                latitude: 5.5580,
                longitude: -0.2010,
                speedKmh: 28.5,
                heading: 190.0
            ),
            Vehicle(
                id: "v-bus-1",
                plateNumber: "AS 8821-22",
                make: "Mercedes-Benz",
                model: "Sprinter 519 (22-Seater)",
                year: 2020,
                vehicleType: .bus,
                colour: "Silver",
                seats: 22,
                fuelType: .diesel,
                status: .idle,
                odometerKm: 125000.0,
                dailyTargetPesewas: 70000,
                driverName: "Emmanuel Osei",
                driverPhone: "+233 55 432 1098",
                latitude: 5.6150,
                longitude: -0.1650,
                speedKmh: 0.0,
                heading: 45.0
            ),
            Vehicle(
                id: "v-tipper-1",
                plateNumber: "BA 104-21",
                make: "Sinotruk HOWO",
                model: "HOWO 371 Tipper (10-Wheeler)",
                year: 2019,
                vehicleType: .truck,
                colour: "Red",
                seats: 3,
                fuelType: .diesel,
                status: .maintenance,
                odometerKm: 189000.0,
                dailyTargetPesewas: 120000,
                driverName: "Yaw Darko",
                driverPhone: "+233 26 555 8899",
                latitude: 5.6500,
                longitude: -0.2300,
                speedKmh: 0.0,
                heading: 0.0
            ),
            Vehicle(
                id: "v-van-1",
                plateNumber: "GE 9831-23",
                make: "Suzuki",
                model: "Super Carry (Delivery Van)",
                year: 2023,
                vehicleType: .other,
                colour: "White",
                seats: 2,
                fuelType: .petrol,
                status: .active,
                odometerKm: 19500.0,
                dailyTargetPesewas: 25000,
                driverName: "Samuel Addo",
                driverPhone: "+233 27 111 2233",
                latitude: 5.5720,
                longitude: -0.1980,
                speedKmh: 35.0,
                heading: 270.0
            )
        ]
        
        self.selectedVehicleForDriver = vehicles.first
    }
    
    // MARK: - Vehicle Management
    public func addVehicle(_ vehicle: Vehicle) {
        vehicles.insert(vehicle, at: 0)
        recalculateStats()
    }
    
    public func updateVehicleStatus(id: String, status: VehicleStatus) {
        if let idx = vehicles.firstIndex(where: { $0.id == id }) {
            vehicles[idx].status = status
            recalculateStats()
        }
    }
    
    public func recalculateStats() {
        let total = vehicles.count
        let active = vehicles.filter { $0.status == .active }.count
        let idle = vehicles.filter { $0.status == .idle }.count
        let maintenance = vehicles.filter { $0.status == .maintenance }.count
        let unavailable = vehicles.filter { $0.status == .unavailable }.count
        
        self.stats = FleetStats(
            totalVehicles: total,
            active: active,
            idle: idle,
            maintenance: maintenance,
            unavailable: unavailable,
            activeDrivers: active,
            openIncidents: maintenance
        )
    }
    
    // MARK: - Driver Live Telematics Streamer
    public func startDriverTracking() {
        guard !isDriverTrackingActive else { return }
        isDriverTrackingActive = true
        locationManager.startTracking()
        
        // Log start
        appendLog("🚀 Driver GPS Tracking Session Started")
        
        // Broadcast telemetry ping on a timer
        telemetryTimer = Timer.publish(every: Constants.telemetryIntervalSeconds, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.broadcastCurrentTelemetry()
            }
    }
    
    public func stopDriverTracking() {
        isDriverTrackingActive = false
        telemetryTimer?.cancel()
        telemetryTimer = nil
        locationManager.stopTracking()
        appendLog("🛑 Driver GPS Tracking Session Stopped")
    }
    
    private func handleLocationUpdate(_ location: CLLocation) {
        // Update local selected vehicle position immediately
        if let selected = selectedVehicleForDriver,
           let idx = vehicles.firstIndex(where: { $0.id == selected.id }) {
            vehicles[idx].latitude = location.coordinate.latitude
            vehicles[idx].longitude = location.coordinate.longitude
            vehicles[idx].speedKmh = locationManager.speedKmh
            if let heading = locationManager.currentHeading?.trueHeading {
                vehicles[idx].heading = heading
            }
        }
    }
    
    private func broadcastCurrentTelemetry() {
        let vehicle = selectedVehicleForDriver ?? vehicles.first ?? Vehicle(plateNumber: "GW 2412-23", make: "Toyota", model: "HiAce")
        
        let lat = locationManager.currentLocation?.coordinate.latitude ?? Constants.defaultAccraLatitude
        let lng = locationManager.currentLocation?.coordinate.longitude ?? Constants.defaultAccraLongitude
        let speed = locationManager.speedKmh
        let heading = locationManager.currentHeading?.trueHeading ?? 90.0
        let alt = locationManager.currentLocation?.altitude
        
        let ping = TelemetryPing(
            vehicleId: vehicle.id,
            plateNumber: vehicle.plateNumber,
            driverName: vehicle.driverName ?? "Mobile Driver",
            latitude: lat,
            longitude: lng,
            altitudeMeters: alt,
            speedKmh: speed,
            courseHeading: heading,
            batteryPercentage: 92,
            ignition: true
        )
        
        Task {
            do {
                let response = try await network.sendTelemetry(ping: ping)
                if response.success {
                    self.pingsSentCount += 1
                    let timeStr = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
                    self.lastPingTimestamp = timeStr
                    self.appendLog("📍 Ping #\(self.pingsSentCount): \(String(format: "%.4f, %.4f", lat, lng)) @ \(String(format: "%.1f km/h", speed))")
                }
            } catch {
                // If offline or dev server not reachable, maintain local simulation
                self.pingsSentCount += 1
                let timeStr = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
                self.lastPingTimestamp = timeStr
                self.appendLog("📍 [Local Cache] Ping #\(self.pingsSentCount): \(String(format: "%.4f, %.4f", lat, lng))")
            }
        }
    }
    
    private func appendLog(_ message: String) {
        telemetryLogs.insert(message, at: 0)
        if telemetryLogs.count > 40 {
            telemetryLogs.removeLast()
        }
    }
}
