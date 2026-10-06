package com.promove.fleet.data.network

import com.promove.fleet.core.Constants
import com.promove.fleet.data.model.FleetPosition
import com.promove.fleet.data.model.PositionsApiResponse
import com.promove.fleet.data.model.TelemetryPing
import com.promove.fleet.data.model.TelemetryResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ProMoveNetworkClient(
    private var baseUrl: String = Constants.DEFAULT_EMULATOR_API_URL
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    fun setBaseUrl(newUrl: String) {
        baseUrl = newUrl
    }

    suspend fun sendTelemetry(ping: TelemetryPing): Result<TelemetryResponse> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/api/gps/telemetry")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 6000
                readTimeout = 6000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            val body = json.encodeToString(TelemetryPing.serializer(), ping)
            OutputStreamWriter(conn.outputStream, "UTF-8").use { writer ->
                writer.write(body)
                writer.flush()
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val responseText = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                val parsed = json.decodeFromString(TelemetryResponse.serializer(), responseText)
                Result.success(parsed)
            } else {
                val errText = conn.errorStream?.bufferedReader()?.use(BufferedReader::readText) ?: "HTTP $responseCode"
                Result.failure(Exception("Error $responseCode: $errText"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun fetchPositions(): Result<List<FleetPosition>> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/api/gps/positions")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 5000
                readTimeout = 5000
                setRequestProperty("Accept", "application/json")
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val responseText = conn.inputStream.bufferedReader().use(BufferedReader::readText)
                val parsed = json.decodeFromString(PositionsApiResponse.serializer(), responseText)
                Result.success(parsed.positions)
            } else {
                Result.failure(Exception("HTTP $responseCode"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun checkHealth(): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/api/system-status")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 3000
                readTimeout = 3000
            }
            conn.responseCode in 200..299
        } catch (e: Exception) {
            false
        }
    }
}
