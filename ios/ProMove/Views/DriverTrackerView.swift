//
//  DriverTrackerView.swift
//  ProMove Fleet
//
//  Driver Mode: In-App High-Accuracy Background GPS Streamer
//  Streams live telemetry pings directly to /api/gps/telemetry
//

import SwiftUI
import CoreLocation

public struct DriverTrackerView: View {
    @ObservedObject var store = FleetStore.shared
    @State private var showingVehiclePicker = false
    
    private var activeVehicle: Vehicle? {
        store.selectedVehicleForDriver ?? store.vehicles.first
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    // Vehicle Selector Header
                    vehicleSelectorCard
                    
                    // Main Telemetry HUD Card
                    telemetryHudCard
                    
                    // Start / Stop Streamer Button
                    streamControlButton
                    
                    // Live Transmission Terminal Log
                    transmissionLogCard
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .background(ProMoveColors.groupedBackground)
            .navigationTitle("Driver Telematics")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    // MARK: - Vehicle Selector
    private var vehicleSelectorCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("ASSIGNED COMMERCIAL VEHICLE")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(ProMoveColors.textSecondary)
            
            HStack {
                if let v = activeVehicle {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("\(v.make) \(v.model)")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(ProMoveColors.textPrimary)
                        
                        Text(v.driverName ?? "Driver: Unassigned")
                            .font(.system(size: 12))
                            .foregroundColor(ProMoveColors.textSecondary)
                    }
                    
                    Spacer()
                    
                    DVLAPlateView(plateNumber: v.plateNumber, isCompact: true)
                } else {
                    Text("No vehicle selected")
                        .foregroundColor(ProMoveColors.textSecondary)
                    Spacer()
                }
            }
        }
        .padding(14)
        .proMoveCard()
    }
    
    // MARK: - Telemetry HUD Card
    private var telemetryHudCard: some View {
        VStack(spacing: 16) {
            // Speedometer Centerpiece
            VStack(spacing: 2) {
                Text(String(format: "%.1f", store.locationManager.speedKmh))
                    .font(.system(size: 64, weight: .heavy, design: .rounded))
                    .foregroundColor(store.isDriverTrackingActive ? ProMoveColors.seaBlue : ProMoveColors.textSecondary)
                
                Text("KM / H")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(ProMoveColors.textSecondary)
            }
            .padding(.top, 8)
            
            Divider()
            
            // Telemetry Gauges Grid
            HStack(spacing: 16) {
                // Compass / Heading
                VStack(spacing: 4) {
                    Image(systemName: "location.north.line.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ProMoveColors.seaBlue)
                        .rotationEffect(.degrees(store.locationManager.currentHeading?.trueHeading ?? 0))
                    
                    Text("Heading")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(ProMoveColors.textSecondary)
                    
                    Text("\(Int(store.locationManager.currentHeading?.trueHeading ?? 0))°")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                }
                .frame(maxWidth: .infinity)
                
                Divider().frame(height: 36)
                
                // Battery
                VStack(spacing: 4) {
                    Image(systemName: "battery.75percent")
                        .font(.system(size: 16))
                        .foregroundColor(ProMoveColors.successGreen)
                    
                    Text("Battery")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(ProMoveColors.textSecondary)
                    
                    Text("92%")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                }
                .frame(maxWidth: .infinity)
                
                Divider().frame(height: 36)
                
                // Pings Count
                VStack(spacing: 4) {
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 16))
                        .foregroundColor(ProMoveColors.electricTeal)
                    
                    Text("Pings Sent")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(ProMoveColors.textSecondary)
                    
                    Text("\(store.pingsSentCount)")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.vertical, 4)
            
            // Coordinates Bar
            HStack {
                Image(systemName: "mappin.and.ellipse")
                    .foregroundColor(ProMoveColors.seaBlue)
                
                if let loc = store.locationManager.currentLocation {
                    Text(String(format: "%.5f° N, %.5f° W  (±%.0fm)", loc.coordinate.latitude, abs(loc.coordinate.longitude), loc.horizontalAccuracy))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(ProMoveColors.textSecondary)
                } else {
                    Text("Acquiring GPS fix (Accra, GH)...")
                        .font(.system(size: 11))
                        .foregroundColor(ProMoveColors.textSecondary)
                }
                
                Spacer()
            }
            .padding(10)
            .background(ProMoveColors.iceSurface)
            .cornerRadius(8)
        }
        .padding(16)
        .proMoveCard()
    }
    
    // MARK: - Stream Control Button
    private var streamControlButton: some View {
        Button(action: {
            if store.isDriverTrackingActive {
                store.stopDriverTracking()
            } else {
                store.startDriverTracking()
            }
        }) {
            HStack(spacing: 12) {
                Image(systemName: store.isDriverTrackingActive ? "stop.circle.fill" : "play.circle.fill")
                    .font(.system(size: 24))
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(store.isDriverTrackingActive ? "STOP LIVE GPS TRANSMISSION" : "START LIVE GPS STREAM")
                        .font(.system(size: 14, weight: .heavy))
                    
                    Text(store.isDriverTrackingActive ? "Background location broadcast active" : "Transmits every 4s to ProMove Fleet Hub")
                        .font(.system(size: 11))
                        .opacity(0.85)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(store.isDriverTrackingActive ? ProMoveColors.dangerRed : ProMoveColors.deepSea)
            .foregroundColor(.white)
            .cornerRadius(12)
            .shadow(color: (store.isDriverTrackingActive ? ProMoveColors.dangerRed : ProMoveColors.deepSea).opacity(0.25), radius: 8, x: 0, y: 4)
        }
    }
    
    // MARK: - Transmission Log Card
    private var transmissionLogCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("TELEMETRY TRANSMISSION LOG")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(ProMoveColors.textSecondary)
                
                Spacer()
                
                if store.isDriverTrackingActive {
                    HStack(spacing: 4) {
                        Circle().fill(ProMoveColors.successGreen).frame(width: 6, height: 6)
                        Text("STREAMING")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(ProMoveColors.successGreen)
                    }
                }
            }
            
            VStack(alignment: .leading, spacing: 6) {
                if store.telemetryLogs.isEmpty {
                    Text("No telemetry pings logged yet. Tap Start to broadcast coordinates.")
                        .font(.system(size: 12))
                        .foregroundColor(ProMoveColors.textSecondary)
                        .padding(.vertical, 8)
                } else {
                    ForEach(store.telemetryLogs.prefix(6), id: \.self) { log in
                        Text(log)
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(ProMoveColors.textPrimary)
                    }
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(8)
        }
        .padding(14)
        .proMoveCard()
    }
}
