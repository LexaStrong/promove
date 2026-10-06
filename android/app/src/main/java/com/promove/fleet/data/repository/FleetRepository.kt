package com.promove.fleet.data.repository

import com.promove.fleet.core.Constants
import com.promove.fleet.data.model.FleetPosition
import com.promove.fleet.data.model.FleetStats
import com.promove.fleet.data.model.FuelType
import com.promove.fleet.data.model.TelemetryPing
import com.promove.fleet.data.model.Vehicle
import com.promove.fleet.data.model.VehicleStatus
import com.promove.fleet.data.model.VehicleType
import com.promove.fleet.data.network.ProMoveNetworkClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object FleetRepository {
    private val network = ProMoveNetworkClient()

    private val initialVehicles = listOf(
        Vehicle(
            id = "v-trotro-1",
            plateNumber = "GW 2412-23",
            make = "Toyota",
            model = "HiAce (Commuter / 15-Seater)",
            year = 2021,
            vehicleType = VehicleType.TROTRO,
            colour = "Yellow & White",
            seats = 15,
            fuelType = FuelType.DIESEL,
            status = VehicleStatus.ACTIVE,
            odometerKm = 78420.0,
            dailyTargetPesewas = 45000,
            driverName = "Kofi Mensah",
            driverPhone = "+233 24 123 4567",
            latitude = 5.6037,
            longitude = -0.1870,
            speedKmh = 42.0,
            heading = 85.0
        ),
        Vehicle(
            id = "v-taxi-1",
            plateNumber = "GR 4512-24",
            make = "Hyundai",
            model = "i10 / Grand i10",
            year = 2022,
            vehicleType = VehicleType.TAXI,
            colour = "Orange & Yellow",
            seats = 5,
            fuelType = FuelType.PETROL,
            status = VehicleStatus.ACTIVE,
            odometerKm = 34100.0,
            dailyTargetPesewas = 30000,
            driverName = "Kwame Boateng",
            driverPhone = "+233 20 987 6543",
            latitude = 5.5580,
            longitude = -0.2010,
            speedKmh = 28.5,
            heading = 190.0
        ),
        Vehicle(
            id = "v-bus-1",
            plateNumber = "AS 8821-22",
            make = "Mercedes-Benz",
            model = "Sprinter 519 (22-Seater)",
            year = 2020,
            vehicleType = VehicleType.BUS,
            colour = "Silver",
            seats = 22,
            fuelType = FuelType.DIESEL,
            status = VehicleStatus.IDLE,
            odometerKm = 125000.0,
            dailyTargetPesewas = 70000,
            driverName = "Emmanuel Osei",
            driverPhone = "+233 55 432 1098",
            latitude = 5.6150,
            longitude = -0.1650,
            speedKmh = 0.0,
            heading = 45.0
        ),
        Vehicle(
            id = "v-tipper-1",
            plateNumber = "BA 104-21",
            make = "Sinotruk HOWO",
            model = "HOWO 371 Tipper (10-Wheeler)",
            year = 2019,
            vehicleType = VehicleType.TRUCK,
            colour = "Red",
            seats = 3,
            fuelType = FuelType.DIESEL,
            status = VehicleStatus.MAINTENANCE,
            odometerKm = 189000.0,
            dailyTargetPesewas = 120000,
            driverName = "Yaw Darko",
            driverPhone = "+233 26 555 8899",
            latitude = 5.6500,
            longitude = -0.2300,
            speedKmh = 0.0,
            heading = 0.0
        ),
        Vehicle(
            id = "v-van-1",
            plateNumber = "GE 9831-23",
            make = "Suzuki",
            model = "Super Carry (Delivery Van)",
            year = 2023,
            vehicleType = VehicleType.OTHER,
            colour = "White",
            seats = 2,
            fuelType = FuelType.PETROL,
            status = VehicleStatus.ACTIVE,
            odometerKm = 19500.0,
            dailyTargetPesewas = 25000,
            driverName = "Samuel Addo",
            driverPhone = "+233 27 111 2233",
            latitude = 5.5720,
            longitude = -0.1980,
            speedKmh = 35.0,
            heading = 270.0
        )
    )

    private val _vehicles = MutableStateFlow(initialVehicles)
    val vehicles: StateFlow<List<Vehicle>> = _vehicles.asStateFlow()

    private val _stats = MutableStateFlow(calculateStats(initialVehicles))
    val stats: StateFlow<FleetStats> = _stats.asStateFlow()

    private val _isTrackingActive = MutableStateFlow(false)
    val isTrackingActive: StateFlow<Boolean> = _isTrackingActive.asStateFlow()

    private val _currentSpeedKmh = MutableStateFlow(0.0)
    val currentSpeedKmh: StateFlow<Double> = _currentSpeedKmh.asStateFlow()

    private val _currentHeading = MutableStateFlow(85.0)
    val currentHeading: StateFlow<Double> = _currentHeading.asStateFlow()

    private val _currentLat = MutableStateFlow(Constants.ACCRA_DEFAULT_LAT)
    val currentLat: StateFlow<Double> = _currentLat.asStateFlow()

    private val _currentLng = MutableStateFlow(Constants.ACCRA_DEFAULT_LNG)
    val currentLng: StateFlow<Double> = _currentLng.asStateFlow()

    private val _pingsSent = MutableStateFlow(0)
    val pingsSent: StateFlow<Int> = _pingsSent.asStateFlow()

    private val _telemetryLogs = MutableStateFlow<List<String>>(emptyList())
    val telemetryLogs: StateFlow<List<String>> = _telemetryLogs.asStateFlow()

    private val _selectedVehicleForDriver = MutableStateFlow<Vehicle?>(initialVehicles.firstOrNull())
    val selectedVehicleForDriver: StateFlow<Vehicle?> = _selectedVehicleForDriver.asStateFlow()

    fun addVehicle(vehicle: Vehicle) {
        val updated = listOf(vehicle) + _vehicles.value
        _vehicles.value = updated
        _stats.value = calculateStats(updated)
    }

    fun updateVehicleStatus(id: String, newStatus: VehicleStatus) {
        val updated = _vehicles.value.map {
            if (it.id == id) it.copy(status = newStatus) else it
        }
        _vehicles.value = updated
        _stats.value = calculateStats(updated)
    }

    fun setTrackingActive(active: Boolean) {
        _isTrackingActive.value = active
        if (active) {
            appendLog("🚀 Driver GPS Tracking Session Started")
        } else {
            appendLog("🛑 Driver GPS Tracking Session Stopped")
            _currentSpeedKmh.value = 0.0
        }
    }

    fun updateTelemetryLocation(lat: Double, lng: Double, speedKmh: Double, heading: Double) {
        _currentLat.value = lat
        _currentLng.value = lng
        _currentSpeedKmh.value = speedKmh
        _currentHeading.value = heading

        // Also update local selected vehicle position
        val selected = _selectedVehicleForDriver.value ?: return
        val updatedList = _vehicles.value.map {
            if (it.id == selected.id) {
                it.copy(latitude = lat, longitude = lng, speedKmh = speedKmh, heading = heading)
            } else it
        }
        _vehicles.value = updatedList
    }

    suspend fun transmitTelemetryPing(batteryPercentage: Int = 90) {
        val vehicle = _selectedVehicleForDriver.value ?: _vehicles.value.first()
        val lat = _currentLat.value
        val lng = _currentLng.value
        val speed = _currentSpeedKmh.value
        val heading = _currentHeading.value

        val ping = TelemetryPing(
            vehicleId = vehicle.id,
            plateNumber = vehicle.plateNumber,
            driverName = vehicle.driverName ?: "Android Driver",
            latitude = lat,
            longitude = lng,
            speedKmh = speed,
            courseHeading = heading,
            batteryPercentage = batteryPercentage,
            ignition = true
        )

        val result = network.sendTelemetry(ping)
        _pingsSent.value += 1
        val timeStr = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())

        if (result.isSuccess) {
            appendLog("📍 [$timeStr] Ping #${_pingsSent.value}: ${String.format(Locale.US, "%.4f, %.4f", lat, lng)} @ ${String.format(Locale.US, "%.1f km/h", speed)}")
        } else {
            appendLog("📍 [$timeStr Cache] Ping #${_pingsSent.value}: ${String.format(Locale.US, "%.4f, %.4f", lat, lng)}")
        }
    }

    private fun appendLog(log: String) {
        val current = _telemetryLogs.value
        val updated = (listOf(log) + current).take(30)
        _telemetryLogs.value = updated
    }

    private fun calculateStats(list: List<Vehicle>): FleetStats {
        val total = list.size
        val active = list.count { it.status == VehicleStatus.ACTIVE }
        val idle = list.count { it.status == VehicleStatus.IDLE }
        val maintenance = list.count { it.status == VehicleStatus.MAINTENANCE }
        val unavailable = list.count { it.status == VehicleStatus.UNAVAILABLE }

        return FleetStats(
            totalVehicles = total,
            active = active,
            idle = idle,
            maintenance = maintenance,
            unavailable = unavailable,
            activeDrivers = active,
            openIncidents = maintenance
        )
    }
}
