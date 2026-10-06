package com.promove.fleet.ui

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.promove.fleet.data.repository.FleetRepository
import com.promove.fleet.service.LocationTrackingService
import com.promove.fleet.theme.DeepSeaBlue
import com.promove.fleet.theme.ElectricTeal
import com.promove.fleet.theme.SeaBlue
import com.promove.fleet.ui.screens.DashboardScreen
import com.promove.fleet.ui.screens.DriverTrackerScreen
import com.promove.fleet.ui.screens.FleetMapScreen
import com.promove.fleet.ui.screens.VehiclesScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    val context = LocalContext.current
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    val isTracking by FleetRepository.isTrackingActive.collectAsState()

    val toggleTracking: () -> Unit = {
        val serviceIntent = Intent(context, LocationTrackingService::class.java).apply {
            action = if (isTracking) LocationTrackingService.ACTION_STOP else LocationTrackingService.ACTION_START
        }
        if (isTracking) {
            context.startService(serviceIntent)
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = when (selectedTab) {
                            0 -> "ProMove Fleet"
                            1 -> "Commercial Vehicles"
                            2 -> "Driver Telematics"
                            3 -> "Live Fleet Map"
                            else -> "ProMove"
                        },
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DeepSeaBlue,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Dashboard", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DeepSeaBlue,
                        selectedTextColor = DeepSeaBlue,
                        indicatorColor = SeaBlue.copy(alpha = 0.15f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.DirectionsCar, contentDescription = "Vehicles") },
                    label = { Text("Vehicles", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DeepSeaBlue,
                        selectedTextColor = DeepSeaBlue,
                        indicatorColor = SeaBlue.copy(alpha = 0.15f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Sensors, contentDescription = "Driver GPS") },
                    label = { Text("Driver GPS", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DeepSeaBlue,
                        selectedTextColor = DeepSeaBlue,
                        indicatorColor = SeaBlue.copy(alpha = 0.15f)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Map, contentDescription = "Live Map") },
                    label = { Text("Live Map", fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DeepSeaBlue,
                        selectedTextColor = DeepSeaBlue,
                        indicatorColor = SeaBlue.copy(alpha = 0.15f)
                    )
                )
            }
        }
    ) { innerPadding ->
        when (selectedTab) {
            0 -> DashboardScreen(
                onNavigateToDriver = { selectedTab = 2 },
                onNavigateToVehicles = { selectedTab = 1 },
                onToggleTracking = toggleTracking,
                modifier = Modifier.padding(innerPadding)
            )
            1 -> VehiclesScreen(
                modifier = Modifier.padding(innerPadding)
            )
            2 -> DriverTrackerScreen(
                modifier = Modifier.padding(innerPadding)
            )
            3 -> FleetMapScreen(
                modifier = Modifier.padding(innerPadding)
            )
        }
    }
}
