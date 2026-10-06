//
//  MainTabView.swift
//  ProMove Fleet
//
//  Root Tab View for ProMove iOS
//

import SwiftUI

public struct MainTabView: View {
    @State private var selectedTab: Int = 0
    
    public init() {}
    
    public var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.bar.xaxis")
                }
                .tag(0)
            
            VehiclesListView()
                .tabItem {
                    Label("Vehicles", systemImage: "car.2.fill")
                }
                .tag(1)
            
            DriverTrackerView()
                .tabItem {
                    Label("Driver GPS", systemImage: "antenna.radiowaves.left.and.right")
                }
                .tag(2)
            
            FleetMapView()
                .tabItem {
                    Label("Live Map", systemImage: "map.fill")
                }
                .tag(3)
        }
        .tint(ProMoveColors.deepSea)
    }
}
