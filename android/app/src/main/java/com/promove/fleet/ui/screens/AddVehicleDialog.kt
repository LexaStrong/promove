package com.promove.fleet.ui.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.promove.fleet.core.GhanaPlateValidator
import com.promove.fleet.data.model.CuratedVehicleCatalog
import com.promove.fleet.data.model.FuelType
import com.promove.fleet.data.model.Vehicle
import com.promove.fleet.data.model.VehicleStatus
import com.promove.fleet.data.model.VehicleType
import com.promove.fleet.data.repository.FleetRepository
import com.promove.fleet.theme.DangerRed
import com.promove.fleet.theme.DeepSeaBlue
import com.promove.fleet.theme.SeaBlue
import com.promove.fleet.theme.SuccessGreen
import com.promove.fleet.theme.TextPrimary
import com.promove.fleet.theme.TextSecondary
import com.promove.fleet.ui.components.DVLAPlateBadge

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddVehicleDialog(
    onDismiss: () -> Unit
) {
    val availableMakes = CuratedVehicleCatalog.makes
    var selectedMakeIndex by remember { mutableIntStateOf(0) }
    val currentMake = availableMakes[selectedMakeIndex]

    var selectedModelName by remember {
        mutableStateOf(currentMake.models.firstOrNull()?.name ?: "")
    }

    var makeExpanded by remember { mutableStateOf(false) }
    var modelExpanded by remember { mutableStateOf(false) }

    var plateInput by remember { mutableStateOf("") }
    var dailyTargetCedis by remember { mutableStateOf("450.00") }
    var driverName by remember { mutableStateOf("") }
    var driverPhone by remember { mutableStateOf("") }
    var selectedFuel by remember { mutableStateOf(FuelType.DIESEL) }
    var selectedType by remember { mutableStateOf(VehicleType.TROTRO) }

    val plateValidation = remember(plateInput) {
        GhanaPlateValidator.validate(plateInput)
    }

    val canSave = plateValidation.isValid && selectedModelName.isNotEmpty()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Register Commercial Vehicle",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Select from Curated Ghana Fleet Catalog",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = SeaBlue
                )

                // Make Dropdown
                ExposedDropdownMenuBox(
                    expanded = makeExpanded,
                    onExpandedChange = { makeExpanded = !makeExpanded }
                ) {
                    OutlinedTextField(
                        value = currentMake.make,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Vehicle Make") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = makeExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = makeExpanded,
                        onDismissRequest = { makeExpanded = false }
                    ) {
                        availableMakes.forEachIndexed { index, make ->
                            DropdownMenuItem(
                                text = { Text(make.make) },
                                onClick = {
                                    selectedMakeIndex = index
                                    val firstModel = make.models.firstOrNull()
                                    selectedModelName = firstModel?.name ?: ""
                                    firstModel?.defaultType?.let { selectedType = it }
                                    makeExpanded = false
                                }
                            )
                        }
                    }
                }

                // Model Dropdown (Dynamically populated from selected Make)
                ExposedDropdownMenuBox(
                    expanded = modelExpanded,
                    onExpandedChange = { modelExpanded = !modelExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedModelName,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Vehicle Model") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = modelExpanded) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = modelExpanded,
                        onDismissRequest = { modelExpanded = false }
                    ) {
                        currentMake.models.forEach { model ->
                            DropdownMenuItem(
                                text = { Text(model.name) },
                                onClick = {
                                    selectedModelName = model.name
                                    selectedType = model.defaultType
                                    modelExpanded = false
                                }
                            )
                        }
                    }
                }

                // Ghana DVLA Plate Input
                OutlinedTextField(
                    value = plateInput,
                    onValueChange = { plateInput = it },
                    label = { Text("DVLA Registration Plate") },
                    placeholder = { Text("e.g. GW 2412-23 or GR 4512-24") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                    trailingIcon = {
                        if (plateInput.isNotEmpty()) {
                            Icon(
                                imageVector = if (plateValidation.isValid) Icons.Default.CheckCircle else Icons.Default.Error,
                                contentDescription = null,
                                tint = if (plateValidation.isValid) SuccessGreen else DangerRed
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                // Plate Preview & Validation info
                if (plateInput.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Plate Preview:", fontSize = 11.sp, color = TextSecondary)
                            DVLAPlateBadge(
                                plateNumber = if (plateValidation.isValid) plateValidation.formattedPlate else plateInput,
                                isCompact = true
                            )
                        }
                        if (plateValidation.regionName != null) {
                            Text(
                                text = "Region: ${plateValidation.regionName}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = SeaBlue
                            )
                        }
                        if (plateValidation.errorMessage != null) {
                            Text(
                                text = plateValidation.errorMessage,
                                fontSize = 11.sp,
                                color = DangerRed
                            )
                        }
                    }
                }

                // Daily Target Cedis
                OutlinedTextField(
                    value = dailyTargetCedis,
                    onValueChange = { dailyTargetCedis = it },
                    label = { Text("Daily Target (GH₵)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )

                // Optional Driver Name & Phone
                OutlinedTextField(
                    value = driverName,
                    onValueChange = { driverName = it },
                    label = { Text("Driver Full Name (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = driverPhone,
                    onValueChange = { driverPhone = it },
                    label = { Text("Driver Phone (Optional)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val cedis = dailyTargetCedis.toDoubleOrNull() ?: 350.0
                    val targetPesewas = (cedis * 100).toInt()
                    val newVehicle = Vehicle(
                        plateNumber = plateValidation.formattedPlate,
                        make = currentMake.make,
                        model = selectedModelName,
                        vehicleType = selectedType,
                        fuelType = selectedFuel,
                        status = VehicleStatus.ACTIVE,
                        dailyTargetPesewas = targetPesewas,
                        driverName = driverName.ifBlank { null },
                        driverPhone = driverPhone.ifBlank { null }
                    )
                    FleetRepository.addVehicle(newVehicle)
                    onDismiss()
                },
                enabled = canSave,
                colors = ButtonDefaults.buttonColors(containerColor = DeepSeaBlue)
            ) {
                Text("Register Vehicle", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
