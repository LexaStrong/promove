//
//  DashboardView.swift
//  ProMove Fleet
//
//  Mobile Dashboard for ProMove Fleet Managers & Owners
//

import SwiftUI

public struct DashboardView: View {
    @ObservedObject var store = FleetStore.shared
    @State private var showingAddSheet = false
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    // Header Banner
                    headerSection
                    
                    // Fleet Quick KPI Grid
                    kpiGridSection
                    
                    // Quick Action Buttons
                    quickActionsSection
                    
                    // Vehicles Table / Card (Vehicle, Plate, Status)
                    vehiclesSection
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .background(ProMoveColors.groupedBackground)
            .navigationTitle("ProMove Fleet")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddSheet = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(ProMoveColors.seaBlue)
                    }
                }
            }
            .sheet(isPresented: $showingAddSheet) {
                AddVehicleSheet()
            }
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Accra Urban Transit Fleet")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(ProMoveColors.textPrimary)
                
                HStack(spacing: 6) {
                    Circle()
                        .fill(store.isDriverTrackingActive ? ProMoveColors.successGreen : ProMoveColors.textSecondary)
                        .frame(width: 8, height: 8)
                    
                    Text(store.isDriverTrackingActive ? "Live GPS Stream Active" : "GPS Hub Standby")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(ProMoveColors.textSecondary)
                }
            }
            
            Spacer()
            
            // ProMove Emblem
            ZStack {
                Circle()
                    .fill(ProMoveColors.deepSea)
                    .frame(width: 44, height: 44)
                
                Image(systemName: "tram.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.white)
            }
        }
        .padding(16)
        .proMoveCard()
    }
    
    // MARK: - KPI Grid
    private var kpiGridSection: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            MetricTileView(
                title: "Total Fleet",
                value: "\(store.stats.totalVehicles)",
                subtitle: "Commercial units",
                systemImage: "car.2.fill",
                iconColor: ProMoveColors.seaBlue
            )
            
            MetricTileView(
                title: "Active on Road",
                value: "\(store.stats.active)",
                subtitle: "\(store.stats.activeDrivers) drivers rolling",
                systemImage: "bolt.fill",
                iconColor: ProMoveColors.successGreen
            )
            
            MetricTileView(
                title: "Idle / Parked",
                value: "\(store.stats.idle)",
                subtitle: "In transit station",
                systemImage: "clock.arrow.circlepath",
                iconColor: Color.blue
            )
            
            MetricTileView(
                title: "Maintenance",
                value: "\(store.stats.maintenance)",
                subtitle: "Workshop inspection",
                systemImage: "wrench.and.screwdriver.fill",
                iconColor: ProMoveColors.ghanaAmber
            )
        }
    }
    
    // MARK: - Quick Actions
    private var quickActionsSection: some View {
        HStack(spacing: 10) {
            Button(action: {
                if store.isDriverTrackingActive {
                    store.stopDriverTracking()
                } else {
                    store.startDriverTracking()
                }
            }) {
                HStack(spacing: 8) {
                    Image(systemName: store.isDriverTrackingActive ? "stop.circle.fill" : "antenna.radiowaves.left.and.right")
                    Text(store.isDriverTrackingActive ? "Stop GPS" : "Driver Mode")
                        .font(.system(size: 13, weight: .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(store.isDriverTrackingActive ? ProMoveColors.dangerRed : ProMoveColors.deepSea)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            
            Button(action: { showingAddSheet = true }) {
                HStack(spacing: 8) {
                    Image(systemName: "plus")
                    Text("Add Vehicle")
                        .font(.system(size: 13, weight: .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(ProMoveColors.iceSurface)
                .foregroundColor(ProMoveColors.deepSea)
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(ProMoveColors.seaBlue.opacity(0.3), lineWidth: 1)
                )
            }
        }
    }
    
    // MARK: - Vehicles Table
    private var vehiclesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Vehicles Roster")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(ProMoveColors.textPrimary)
                
                Spacer()
                
                Text("\(store.vehicles.count) registered")
                    .font(.system(size: 12))
                    .foregroundColor(ProMoveColors.textSecondary)
            }
            
            // Strictly order: Vehicle, Plate, Status (as specified by user)
            VStack(spacing: 0) {
                // Table Header
                HStack {
                    Text("Vehicle")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(ProMoveColors.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Text("Plate")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(ProMoveColors.textSecondary)
                        .frame(width: 110, alignment: .center)
                    
                    Text("Status")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(ProMoveColors.textSecondary)
                        .frame(width: 90, alignment: .trailing)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(ProMoveColors.iceSurface.opacity(0.6))
                
                Divider()
                
                // Table Rows
                ForEach(store.vehicles.prefix(6)) { vehicle in
                    HStack {
                        // 1. Vehicle Make & Model
                        VStack(alignment: .leading, spacing: 2) {
                            Text(vehicle.make)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(ProMoveColors.textPrimary)
                            
                            Text(vehicle.model)
                                .font(.system(size: 11))
                                .foregroundColor(ProMoveColors.textSecondary)
                                .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        
                        // 2. DVLA Plate
                        DVLAPlateView(plateNumber: vehicle.plateNumber, isCompact: true)
                            .frame(width: 110, alignment: .center)
                        
                        // 3. Status Badge
                        StatusBadgeView(status: vehicle.status)
                            .frame(width: 90, alignment: .trailing)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    
                    if vehicle.id != store.vehicles.prefix(6).last?.id {
                        Divider().padding(.horizontal, 14)
                    }
                }
            }
            .proMoveCard()
        }
    }
}
