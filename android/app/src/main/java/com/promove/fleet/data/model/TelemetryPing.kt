package com.promove.fleet.data.model

import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Serializable
data class TelemetryPing(
    val vehicleId: String,
    val plateNumber: String,
    val driverName: String,
    val latitude: Double,
    val longitude: Double,
    val altitudeMeters: Double? = null,
    val speedKmh: Double = 0.0,
    val courseHeading: Double? = null,
    val batteryPercentage: Int? = null,
    val ignition: Boolean = true,
    val timestamp: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
)

@Serializable
data class TelemetryResponse(
    val success: Boolean,
    val position: FleetPosition? = null,
    val alerts: List<FleetAlert>? = null,
    val error: String? = null
)

@Serializable
data class FleetPosition(
    val vehicleId: String,
    val plateNumber: String,
    val driverName: String? = null,
    val latitude: Double,
    val longitude: Double,
    val altitudeMeters: Double? = null,
    val speedKmh: Double = 0.0,
    val courseHeading: Double? = null,
    val batteryPercentage: Int? = null,
    val ignition: Boolean = true,
    val timestamp: String
)

@Serializable
data class FleetAlert(
    val id: String,
    val vehicleId: String,
    val plateNumber: String,
    val alertType: String,
    val severity: String,
    val message: String,
    val timestamp: String
)

@Serializable
data class PositionsApiResponse(
    val success: Boolean,
    val timestamp: String,
    val count: Int,
    val positions: List<FleetPosition>,
    val alerts: List<FleetAlert>? = null
)

data class FleetStats(
    val totalVehicles: Int = 0,
    val active: Int = 0,
    val idle: Int = 0,
    val maintenance: Int = 0,
    val unavailable: Int = 0,
    val activeDrivers: Int = 0,
    val openIncidents: Int = 0
)
