//
//  AddVehicleSheet.swift
//  ProMove Fleet
//
//  Vehicle registration sheet with curated make/model dropdowns and Ghana DVLA plate validation
//

import SwiftUI

public struct AddVehicleSheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var store = FleetStore.shared
    
    // Curated catalog makes
    private let availableMakes = CuratedVehicleCatalog.makes
    
    @State private var selectedMakeIndex: Int = 0
    @State private var selectedModelName: String = "HiAce (Commuter / 15-Seater)"
    @State private var plateInput: String = ""
    @State private var selectedType: VehicleType = .trotro
    @State private var selectedFuel: FuelType = .diesel
    @State private var year: Int = 2022
    @State private var colour: String = "Yellow & White"
    @State private var dailyTargetCedis: String = "450.00"
    @State private var driverName: String = ""
    @State private var driverPhone: String = ""
    
    private var currentMake: VehicleCatalogMake {
        availableMakes[selectedMakeIndex]
    }
    
    private var plateValidation: GhanaPlateValidationResult {
        GhanaPlateValidator.validate(plateInput)
    }
    
    private var isValidToSubmit: Bool {
        !plateInput.isEmpty && plateValidation.isValid && !selectedModelName.isEmpty
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                // Section 1: Curated Make & Model Dropdowns
                Section(header: Text("Vehicle Classification (Ghana Fleet)")) {
                    // Make Dropdown Picker
                    Picker("Make", selection: $selectedMakeIndex) {
                        ForEach(0..<availableMakes.count, id: \.self) { idx in
                            Text(availableMakes[idx].make).tag(idx)
                        }
                    }
                    .onChange(of: selectedMakeIndex) { _, newIdx in
                        let firstModel = availableMakes[newIdx].models.first?.name ?? ""
                        selectedModelName = firstModel
                        // Auto-assign vehicle type if model defines one
                        if let firstType = availableMakes[newIdx].models.first?.types.first {
                            selectedType = firstType
                        }
                    }
                    
                    // Model Dropdown Picker (Dynamically filtered by chosen Make)
                    Picker("Model", selection: $selectedModelName) {
                        ForEach(currentMake.models, id: \.name) { model in
                            Text(model.name).tag(model.name)
                        }
                    }
                    
                    // Vehicle Type
                    Picker("Type", selection: $selectedType) {
                        ForEach(VehicleType.allCases) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                    
                    // Year
                    Picker("Manufacturing Year", selection: $year) {
                        ForEach((2005...2026).reversed(), id: \.self) { y in
                            Text(String(y)).tag(y)
                        }
                    }
                }
                
                // Section 2: DVLA Registration Plate
                Section(header: Text("Ghana DVLA Registration Plate")) {
                    HStack {
                        TextField("e.g. GW 2412-23, GR 4512-24", text: $plateInput)
                            .textInputAutocapitalization(.characters)
                            .autocorrectionDisabled()
                            .font(.system(size: 15, design: .monospaced))
                        
                        if !plateInput.isEmpty {
                            Image(systemName: plateValidation.isValid ? "checkmark.seal.fill" : "exclamationmark.circle.fill")
                                .foregroundColor(plateValidation.isValid ? ProMoveColors.successGreen : ProMoveColors.dangerRed)
                        }
                    }
                    
                    // Visual Preview Badge
                    if !plateInput.isEmpty {
                        HStack {
                            Text("Plate Preview:")
                                .font(.system(size: 12))
                                .foregroundColor(ProMoveColors.textSecondary)
                            Spacer()
                            DVLAPlateView(plateNumber: plateValidation.isValid ? plateValidation.formattedPlate : plateInput)
                        }
                        .padding(.vertical, 4)
                        
                        if let regionName = plateValidation.regionName {
                            Text("Region: \(regionName)")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(ProMoveColors.seaBlue)
                        }
                        
                        if let err = plateValidation.errorMessage {
                            Text(err)
                                .font(.system(size: 11))
                                .foregroundColor(ProMoveColors.dangerRed)
                        }
                    }
                }
                
                // Section 3: Operations & Driver
                Section(header: Text("Operations & Driver Assignment")) {
                    Picker("Fuel Type", selection: $selectedFuel) {
                        ForEach(FuelType.allCases) { fuel in
                            Text(fuel.displayName).tag(fuel)
                        }
                    }
                    
                    HStack {
                        Text("Daily Target (GH₵)")
                        Spacer()
                        TextField("350.00", text: $dailyTargetCedis)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    
                    TextField("Driver Full Name (Optional)", text: $driverName)
                    TextField("Driver Phone (e.g. 0244123456)", text: $driverPhone)
                        .keyboardType(.phonePad)
                }
            }
            .navigationTitle("Register Vehicle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveVehicle()
                    }
                    .font(.system(size: 14, weight: .bold))
                    .disabled(!isValidToSubmit)
                }
            }
        }
    }
    
    private func saveVehicle() {
        let cedisAmount = Double(dailyTargetCedis) ?? 350.0
        let targetPesewas = Int(cedisAmount * 100)
        
        let newVehicle = Vehicle(
            plateNumber: plateValidation.formattedPlate,
            make: currentMake.make,
            model: selectedModelName,
            year: year,
            vehicleType: selectedType,
            colour: colour,
            fuelType: selectedFuel,
            status: .active,
            odometerKm: 0.0,
            dailyTargetPesewas: targetPesewas,
            driverName: driverName.isEmpty ? nil : driverName,
            driverPhone: driverPhone.isEmpty ? nil : driverPhone,
            latitude: Constants.defaultAccraLatitude,
            longitude: Constants.defaultAccraLongitude,
            speedKmh: 0.0
        )
        
        store.addVehicle(newVehicle)
        dismiss()
    }
}
