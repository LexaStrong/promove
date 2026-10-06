//
//  FleetMapView.swift
//  ProMove Fleet
//
//  Live Interactive MapKit Fleet Tracker
//

import SwiftUI
import MapKit

public struct FleetMapView: View {
    @ObservedObject var store = FleetStore.shared
    
    @State private var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 5.6037, longitude: -0.1870),
            span: MKCoordinateSpan(latitudeDelta: 0.12, longitudeDelta: 0.12)
        )
    )
    
    @State private var selectedVehicle: Vehicle?
    
    public var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                // MapKit View
                Map(position: $cameraPosition) {
                    ForEach(store.vehicles) { vehicle in
                        if let lat = vehicle.latitude, let lng = vehicle.longitude {
                            Annotation(vehicle.plateNumber, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                                Button(action: {
                                    withAnimation { selectedVehicle = vehicle }
                                }) {
                                    VStack(spacing: 2) {
                                        ZStack {
                                            Circle()
                                                .fill(statusColor(for: vehicle.status))
                                                .frame(width: 32, height: 32)
                                                .shadow(radius: 3)
                                            
                                            Image(systemName: iconForType(vehicle.vehicleType))
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(.white)
                                        }
                                        
                                        Text(vehicle.plateNumber)
                                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                                            .padding(.horizontal, 4)
                                            .padding(.vertical, 1)
                                            .background(Color.white.opacity(0.95))
                                            .cornerRadius(3)
                                            .shadow(radius: 1)
                                    }
                                }
                            }
                        }
                    }
                }
                .mapStyle(.standard(elevation: .realistic))
                .ignoresSafeArea(edges: .top)
                
                // Bottom Selected Vehicle Card
                if let v = selectedVehicle {
                    vehicleDetailCard(v)
                        .padding(.horizontal, 16)
                        .padding(.bottom, 16)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .navigationTitle("Live Fleet Map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: resetToAccra) {
                        Image(systemName: "location.fill")
                            .foregroundColor(ProMoveColors.seaBlue)
                    }
                }
            }
        }
    }
    
    private func resetToAccra() {
        withAnimation {
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: 5.6037, longitude: -0.1870),
                    span: MKCoordinateSpan(latitudeDelta: 0.12, longitudeDelta: 0.12)
                )
            )
        }
    }
    
    private func vehicleDetailCard(_ vehicle: Vehicle) -> some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(vehicle.make) \(vehicle.model)")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(ProMoveColors.textPrimary)
                    
                    Text("Driver: \(vehicle.driverName ?? "Unassigned")")
                        .font(.system(size: 12))
                        .foregroundColor(ProMoveColors.textSecondary)
                }
                
                Spacer()
                
                Button(action: {
                    withAnimation { selectedVehicle = nil }
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(ProMoveColors.textSecondary)
                }
            }
            
            Divider()
            
            HStack {
                DVLAPlateView(plateNumber: vehicle.plateNumber, isCompact: true)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "speedometer")
                        .font(.system(size: 12))
                        .foregroundColor(ProMoveColors.seaBlue)
                    Text("\(Int(vehicle.speedKmh ?? 0)) km/h")
                        .font(.system(size: 13, weight: .bold))
                }
                
                Spacer()
                
                StatusBadgeView(status: vehicle.status)
            }
        }
        .padding(14)
        .proMoveCard()
    }
    
    private func statusColor(for status: VehicleStatus) -> Color {
        switch status {
        case .active: return ProMoveColors.successGreen
        case .idle: return Color.blue
        case .maintenance: return ProMoveColors.ghanaAmber
        case .unavailable: return ProMoveColors.dangerRed
        }
    }
    
    private func iconForType(_ type: VehicleType) -> String {
        switch type {
        case .trotro: return "bus.fill"
        case .taxi: return "car.fill"
        case .bus: return "tram.fill"
        case .truck: return "box.truck.fill"
        case .pickup: return "car.side.fill"
        case .other: return "shippingbox.fill"
        }
    }
}
