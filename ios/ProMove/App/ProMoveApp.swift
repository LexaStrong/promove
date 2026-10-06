//
//  ProMoveApp.swift
//  ProMove Fleet
//
//  Application entry point for ProMove iOS
//

import SwiftUI

@main
struct ProMoveApp: App {
    @StateObject private var store = FleetStore.shared
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(store)
        }
    }
}
