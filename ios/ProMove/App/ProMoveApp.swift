//
//  ProMoveApp.swift
//  ProMove Fleet
//
//  Application entry point for ProMove iOS
//

import SwiftUI

@main
struct ProMoveApp: App {
    @State private var showSplash: Bool = true
    
    var body: some Scene {
        WindowGroup {
            ZStack {
                if showSplash {
                    SplashScreenView {
                        withAnimation(.easeInOut(duration: 0.35)) {
                            showSplash = false
                        }
                    }
                } else {
                    MobileWebView()
                        .transition(.opacity)
                }
            }
        }
    }
}
