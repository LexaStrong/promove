package com.promove.fleet.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.promove.fleet.data.model.VehicleType
import com.promove.fleet.data.repository.FleetRepository
import com.promove.fleet.theme.BorderSubtle
import com.promove.fleet.theme.DeepSeaBlue
import com.promove.fleet.theme.SoftIce
import com.promove.fleet.theme.TextPrimary
import com.promove.fleet.theme.TextSecondary
import com.promove.fleet.ui.components.DVLAPlateBadge
import com.promove.fleet.ui.components.FilterChipItem
import com.promove.fleet.ui.components.StatusChip

@Composable
fun VehiclesScreen(
    modifier: Modifier = Modifier
) {
    val vehicles by FleetRepository.vehicles.collectAsState()
    var selectedTypeFilter by remember { mutableStateOf<VehicleType?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var showAddDialog by remember { mutableStateOf(false) }

    val filteredVehicles = remember(vehicles, selectedTypeFilter, searchQuery) {
        vehicles.filter { v ->
            val matchesType = selectedTypeFilter == null || v.vehicleType == selectedTypeFilter
            val matchesQuery = searchQuery.isBlank() ||
                v.plateNumber.contains(searchQuery, ignoreCase = true) ||
                v.make.contains(searchQuery, ignoreCase = true) ||
                v.model.contains(searchQuery, ignoreCase = true)
            matchesType && matchesQuery
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = DeepSeaBlue,
                contentColor = Color.White
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Vehicle")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search plate or make...") },
                leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Category Filter Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChipItem(
                    title = "All (${vehicles.size})",
                    isSelected = selectedTypeFilter == null,
                    onClick = { selectedTypeFilter = null }
                )
                VehicleType.entries.forEach { type ->
                    val count = vehicles.count { it.vehicleType == type }
                    val shortName = type.displayName.split(" ").first()
                    FilterChipItem(
                        title = "$shortName ($count)",
                        isSelected = selectedTypeFilter == type,
                        onClick = { selectedTypeFilter = type }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main Table Card (strictly formatted: Vehicle, Plate, Status)
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(14.dp)),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column {
                    // Table Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SoftIce)
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Vehicle",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = "Plate",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary,
                            modifier = Modifier.width(115.dp)
                        )
                        Text(
                            text = "Status",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary,
                            modifier = Modifier.width(85.dp)
                        )
                    }

                    HorizontalDivider(color = BorderSubtle)

                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(bottom = 80.dp)
                    ) {
                        items(filteredVehicles, key = { it.id }) { vehicle ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 14.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // 1. Vehicle
                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = vehicle.make,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = vehicle.model,
                                        fontSize = 11.sp,
                                        color = TextSecondary,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                // 2. Plate
                                Box(modifier = Modifier.width(115.dp)) {
                                    DVLAPlateBadge(
                                        plateNumber = vehicle.plateNumber,
                                        isCompact = true
                                    )
                                }

                                // 3. Status
                                Box(modifier = Modifier.width(85.dp)) {
                                    StatusChip(status = vehicle.status)
                                }
                            }
                            HorizontalDivider(color = BorderSubtle)
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddVehicleDialog(onDismiss = { showAddDialog = false })
    }
}
