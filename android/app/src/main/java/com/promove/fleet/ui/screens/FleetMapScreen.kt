package com.promove.fleet.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.promove.fleet.data.model.Vehicle
import com.promove.fleet.data.model.VehicleStatus
import com.promove.fleet.data.repository.FleetRepository
import com.promove.fleet.theme.BorderSubtle
import com.promove.fleet.theme.DangerRed
import com.promove.fleet.theme.DeepSeaBlue
import com.promove.fleet.theme.GhanaAmber
import com.promove.fleet.theme.SeaBlue
import com.promove.fleet.theme.SoftIce
import com.promove.fleet.theme.SuccessGreen
import com.promove.fleet.theme.TextPrimary
import com.promove.fleet.theme.TextSecondary
import com.promove.fleet.ui.components.DVLAPlateBadge
import com.promove.fleet.ui.components.StatusChip

@Composable
fun FleetMapScreen(
    modifier: Modifier = Modifier
) {
    val vehicles by FleetRepository.vehicles.collectAsState()
    var selectedVehicle by remember { mutableStateOf<Vehicle?>(vehicles.firstOrNull()) }

    Box(modifier = modifier.fillMaxSize()) {
        // Radar / Fleet Coordinates Canvas Map
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .pointerInput(vehicles) {
                    detectTapGestures { offset ->
                        // Hit test on vehicle pins plotted on canvas
                        val w = size.width
                        val h = size.height
                        val minLat = 5.5300
                        val maxLat = 5.6700
                        val minLng = -0.2500
                        val maxLng = -0.1500

                        var closest: Vehicle? = null
                        var minDistance = 50f // touch radius in pixels

                        vehicles.forEach { v ->
                            val vLat = v.latitude ?: 5.6037
                            val vLng = v.longitude ?: -0.1870
                            val x = ((vLng - minLng) / (maxLng - minLng) * w).toFloat()
                            val y = ((maxLat - vLat) / (maxLat - minLat) * h).toFloat()
                            val dist = kotlin.math.hypot(offset.x - x, offset.y - y)
                            if (dist < minDistance) {
                                closest = v
                                minDistance = dist
                            }
                        }
                        if (closest != null) {
                            selectedVehicle = closest
                        }
                    }
                }
        ) {
            val w = size.width
            val h = size.height

            // Draw radar grid rings
            val center = Offset(w / 2f, h / 2f)
            drawCircle(color = Color(0xFF1E293B), radius = w * 0.45f, style = Stroke(width = 1f))
            drawCircle(color = Color(0xFF1E293B), radius = w * 0.30f, style = Stroke(width = 1f))
            drawCircle(color = Color(0xFF1E293B), radius = w * 0.15f, style = Stroke(width = 1f))
            drawLine(color = Color(0xFF1E293B), start = Offset(0f, h / 2f), end = Offset(w, h / 2f), strokeWidth = 1f)
            drawLine(color = Color(0xFF1E293B), start = Offset(w / 2f, 0f), end = Offset(w / 2f, h), strokeWidth = 1f)

            // Plot Vehicles
            val minLat = 5.5300
            val maxLat = 5.6700
            val minLng = -0.2500
            val maxLng = -0.1500

            vehicles.forEach { v ->
                val vLat = v.latitude ?: 5.6037
                val vLng = v.longitude ?: -0.1870
                val px = ((vLng - minLng) / (maxLng - minLng) * w).toFloat()
                val py = ((maxLat - vLat) / (maxLat - minLat) * h).toFloat()

                val pinColor = when (v.status) {
                    VehicleStatus.ACTIVE -> Color(0xFF10B981)
                    VehicleStatus.IDLE -> Color(0xFF0284C7)
                    VehicleStatus.MAINTENANCE -> Color(0xFFF59E0B)
                    VehicleStatus.UNAVAILABLE -> Color(0xFFEF4444)
                }

                // Outer pulse circle
                drawCircle(color = pinColor.copy(alpha = 0.25f), radius = 24f, center = Offset(px, py))
                // Inner solid pin
                drawCircle(color = pinColor, radius = 12f, center = Offset(px, py))
                drawCircle(color = Color.White, radius = 4f, center = Offset(px, py))
            }
        }

        // Top Status Legend
        Card(
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B).copy(alpha = 0.92f)),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                LegendItem("Active (${vehicles.count { it.status == VehicleStatus.ACTIVE }})", SuccessGreen)
                LegendItem("Idle (${vehicles.count { it.status == VehicleStatus.IDLE }})", Color(0xFF0284C7))
                LegendItem("Maint (${vehicles.count { it.status == VehicleStatus.MAINTENANCE }})", GhanaAmber)
            }
        }

        // Bottom Selected Vehicle Card
        selectedVehicle?.let { v ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(16.dp)),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(
                                text = "${v.make} ${v.model}",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Driver: ${v.driverName ?: "Unassigned"}",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }

                        IconButton(
                            onClick = { selectedVehicle = null },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                        }
                    }

                    HorizontalDivider(color = BorderSubtle)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        DVLAPlateBadge(plateNumber = v.plateNumber, isCompact = true)

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Speed, contentDescription = null, tint = SeaBlue, modifier = Modifier.size(16.dp))
                            Text(
                                text = "${v.speedKmh?.toInt() ?: 0} km/h",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }

                        StatusChip(status = v.status)
                    }
                }
            }
        }
    }
}

@Composable
private fun LegendItem(label: String, color: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .clip(CircleShape)
                .background(color)
        )
        Text(text = label, fontSize = 11.sp, color = Color.White)
    }
}
