//
//  VehiclesListView.swift
//  ProMove Fleet
//
//  Vehicles List screen adhering strictly to mobile layout: Vehicle, Plate, Status
//

import SwiftUI

public struct VehiclesListView: View {
    @ObservedObject var store = FleetStore.shared
    @State private var selectedFilter: VehicleType? = nil
    @State private var searchQuery: String = ""
    @State private var showingAddSheet = false
    
    private var filteredVehicles: [Vehicle] {
        store.vehicles.filter { vehicle in
            let matchesType = selectedFilter == nil || vehicle.vehicleType == selectedFilter
            let matchesSearch = searchQuery.isEmpty ||
                vehicle.plateNumber.localizedCaseInsensitiveContains(searchQuery) ||
                vehicle.make.localizedCaseInsensitiveContains(searchQuery) ||
                vehicle.model.localizedCaseInsensitiveContains(searchQuery)
            return matchesType && matchesSearch
        }
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter Segment Pills
                filterChipsBar
                
                // Vehicle Table / List
                if filteredVehicles.isEmpty {
                    emptyStateView
                } else {
                    List {
                        // Table Header row
                        Section {
                            ForEach(filteredVehicles) { vehicle in
                                HStack {
                                    // 1. Vehicle (Make & Model)
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(vehicle.make)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(ProMoveColors.textPrimary)
                                        
                                        Text(vehicle.model)
                                            .font(.system(size: 12))
                                            .foregroundColor(ProMoveColors.textSecondary)
                                            .lineLimit(1)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    
                                    // 2. Plate (Ghana DVLA)
                                    DVLAPlateView(plateNumber: vehicle.plateNumber, isCompact: true)
                                        .frame(width: 110, alignment: .center)
                                    
                                    // 3. Status (Badge)
                                    StatusBadgeView(status: vehicle.status)
                                        .frame(width: 85, alignment: .trailing)
                                }
                                .padding(.vertical, 4)
                            }
                        } header: {
                            HStack {
                                Text("Vehicle")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("Plate")
                                    .frame(width: 110, alignment: .center)
                                Text("Status")
                                    .frame(width: 85, alignment: .trailing)
                            }
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(ProMoveColors.textSecondary)
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .searchable(text: $searchQuery, prompt: "Search plate or make...")
            .navigationTitle("Vehicles")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddSheet = true }) {
                        Label("Add Vehicle", systemImage: "plus")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(ProMoveColors.seaBlue)
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddVehicleSheet()
            }
        }
    }
    
    // MARK: - Filter Chips
    private var filterChipsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(title: "All (\(store.vehicles.count))", isSelected: selectedFilter == nil) {
                    selectedFilter = nil
                }
                
                ForEach([VehicleType.trotro, VehicleType.taxi, VehicleType.bus, VehicleType.truck, VehicleType.other], id: \.self) { type in
                    let count = store.vehicles.filter { $0.vehicleType == type }.count
                    filterChip(title: "\(type.displayName.components(separatedBy: " ").first ?? type.rawValue) (\(count))", isSelected: selectedFilter == type) {
                        selectedFilter = type
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .background(ProMoveColors.cardBackground)
    }
    
    private func filterChip(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: isSelected ? .bold : .medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? ProMoveColors.deepSea : ProMoveColors.iceSurface)
                .foregroundColor(isSelected ? .white : ProMoveColors.deepSea)
                .cornerRadius(20)
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Spacer()
            Image(systemName: "car.side.fill")
                .font(.system(size: 44))
                .foregroundColor(ProMoveColors.textSecondary.opacity(0.5))
            
            Text("No vehicles found")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(ProMoveColors.textPrimary)
            
            Text("Add your first trotro, taxi, or truck to begin fleet tracking.")
                .font(.system(size: 13))
                .foregroundColor(ProMoveColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            Button(action: { showingAddSheet = true }) {
                Text("+ Register Vehicle")
                    .font(.system(size: 14, weight: .bold))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(ProMoveColors.deepSea)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .padding(.top, 8)
            
            Spacer()
        }
    }
}
