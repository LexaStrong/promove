package com.promove.fleet.service

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.promove.fleet.core.Constants
import com.promove.fleet.data.repository.FleetRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class LocationTrackingService : Service(), LocationListener {
    private val serviceScope = CoroutineScope(Dispatchers.Default + Job())
    private var transmissionJob: Job? = null
    private var locationManager: LocationManager? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == ACTION_STOP) {
            stopTracking()
            stopSelf()
            return START_NOT_STICKY
        }

        startTracking()
        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startTracking() {
        val notification = buildNotification("Live GPS telemetry streaming active")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                Constants.NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(Constants.NOTIFICATION_ID, notification)
        }

        FleetRepository.setTrackingActive(true)

        try {
            locationManager?.let { lm ->
                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    lm.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        2000L,
                        3.0f,
                        this
                    )
                }
                if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    lm.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        4000L,
                        5.0f,
                        this
                    )
                }
            }
        } catch (_: SecurityException) {}

        // Periodically transmit telemetry
        transmissionJob?.cancel()
        transmissionJob = serviceScope.launch {
            while (isActive) {
                delay(Constants.TELEMETRY_INTERVAL_MS)
                val batteryPct = getBatteryPercentage()
                FleetRepository.transmitTelemetryPing(batteryPct)
                updateNotification()
            }
        }
    }

    private fun stopTracking() {
        transmissionJob?.cancel()
        transmissionJob = null
        try {
            locationManager?.removeUpdates(this)
        } catch (_: Exception) {}
        FleetRepository.setTrackingActive(false)
        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    override fun onLocationChanged(location: Location) {
        val speedKmh = if (location.hasSpeed()) (location.speed * 3.6).toDouble() else 0.0
        val heading = if (location.hasBearing()) location.bearing.toDouble() else 85.0
        FleetRepository.updateTelemetryLocation(
            lat = location.latitude,
            lng = location.longitude,
            speedKmh = speedKmh,
            heading = heading
        )
    }

    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}

    private fun getBatteryPercentage(): Int {
        val bm = getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 88
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                Constants.NOTIFICATION_CHANNEL_ID,
                Constants.NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notifies when driver is broadcasting GPS coordinates"
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(statusText: String): Notification {
        return NotificationCompat.Builder(this, Constants.NOTIFICATION_CHANNEL_ID)
            .setContentTitle("ProMove Fleet Tracking")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification() {
        val speed = FleetRepository.currentSpeedKmh.value
        val pings = FleetRepository.pingsSent.value
        val text = "Broadcasting @ ${String.format("%.1f", speed)} km/h • $pings pings sent"
        val nm = getSystemService(NotificationManager::class.java)
        nm?.notify(Constants.NOTIFICATION_ID, buildNotification(text))
    }

    override fun onDestroy() {
        stopTracking()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val ACTION_START = "com.promove.fleet.ACTION_START"
        const val ACTION_STOP = "com.promove.fleet.ACTION_STOP"
    }
}
