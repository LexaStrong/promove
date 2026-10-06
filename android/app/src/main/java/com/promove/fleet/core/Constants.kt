package com.promove.fleet.core

object Constants {
    // Default local backend for emulator / device
    // 10.0.2.2 maps to host localhost in Android emulator, fallback to localhost:3000
    const val DEFAULT_EMULATOR_API_URL = "http://10.0.2.2:3000"
    const val DEFAULT_LOCAL_API_URL = "http://localhost:3000"
    const val FALLBACK_API_URL = "https://promove.africa"

    // Telemetry ping interval (milliseconds)
    const val TELEMETRY_INTERVAL_MS = 4000L

    // Notification Channel ID
    const val NOTIFICATION_CHANNEL_ID = "promove_location_tracking"
    const val NOTIFICATION_CHANNEL_NAME = "ProMove GPS Telemetry"
    const val NOTIFICATION_ID = 1001

    // Default Accra Center Coordinate
    const val ACCRA_DEFAULT_LAT = 5.6037
    const val ACCRA_DEFAULT_LNG = -0.1870
}

enum class GhanaRegion(val code: String, val regionName: String) {
    GREATER_ACCRA_CENTRAL("GR", "Greater Accra (Central)"),
    GREATER_ACCRA_EAST("GE", "Greater Accra (East)"),
    GREATER_ACCRA_WEST("GW", "Greater Accra (West - Weija/Kasoa)"),
    GREATER_ACCRA_SOUTH("GS", "Greater Accra (South)"),
    GREATER_ACCRA_TEMA("GT", "Tema Metropolitan"),
    GREATER_ACCRA_NORTH("GN", "Greater Accra (North - Amasaman)"),
    ASHANTI_SOUTH("AS", "Ashanti (Kumasi South)"),
    ASHANTI_EAST("AE", "Ashanti (Kumasi East)"),
    ASHANTI_WEST("AW", "Ashanti (Kumasi West)"),
    BONO_SUNYANI("BA", "Bono (Sunyani)"),
    BONO_EAST("BE", "Bono East (Techiman)"),
    CENTRAL_REGION("CR", "Central (Cape Coast)"),
    EASTERN_REGION("ER", "Eastern (Koforidua)"),
    VOLTA_REGION("VR", "Volta (Ho)"),
    WESTERN_REGION("WR", "Western (Sekondi-Takoradi)"),
    NORTHERN_TAMALE("NR", "Northern (Tamale)"),
    UPPER_EAST("UE", "Upper East (Bolgatanga)"),
    UPPER_WEST("UW", "Upper West (Wa)"),
    TRADE_PLATE("DV", "DVLA Trade Plate"),
    DEFECTIVE_PLATE("DP", "DVLA Defective Plate");

    companion object {
        fun findByCode(code: String): GhanaRegion? = entries.find { it.code.equals(code, ignoreCase = true) }
    }
}
