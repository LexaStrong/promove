package com.promove.fleet.data.model

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
enum class VehicleType(val displayName: String) {
    TROTRO("Trotro (Minibus)"),
    TAXI("Taxi / Ride Hailing"),
    BUS("Intercity Coach / Bus"),
    TRUCK("Haulage / Tipper"),
    PICKUP("Commercial Pickup"),
    OTHER("Delivery / Light Van")
}

@Serializable
enum class VehicleStatus(val displayName: String) {
    ACTIVE("Active"),
    IDLE("Idle"),
    MAINTENANCE("Maintenance"),
    UNAVAILABLE("Unavailable")
}

@Serializable
enum class FuelType(val displayName: String) {
    PETROL("Petrol"),
    DIESEL("Diesel"),
    LPG("Auto-Gas (LPG)"),
    ELECTRIC("Electric (EV)")
}

@Serializable
data class Vehicle(
    val id: String = UUID.randomUUID().toString(),
    val orgId: String = "org-accra-1",
    val plateNumber: String,
    val make: String,
    val model: String,
    val year: Int = 2021,
    val vehicleType: VehicleType = VehicleType.TROTRO,
    val colour: String? = null,
    val vin: String? = null,
    val seats: Int? = 15,
    val fuelType: FuelType = FuelType.DIESEL,
    val status: VehicleStatus = VehicleStatus.ACTIVE,
    val odometerKm: Double = 0.0,
    val dailyTargetPesewas: Int? = 35000,
    val driverName: String? = null,
    val driverPhone: String? = null,
    val lastPingTime: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val speedKmh: Double? = null,
    val heading: Double? = null
) {
    val dailyTargetCedisString: String
        get() {
            val pesewas = dailyTargetPesewas ?: return "GH₵ 0.00"
            val cedis = pesewas / 100.0
            return String.format("GH₵ %.2f", cedis)
        }
}
