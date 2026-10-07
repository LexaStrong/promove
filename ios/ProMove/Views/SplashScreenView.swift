//
//  SplashScreenView.swift
//  ProMove Fleet
//
//  Mobile Splash Screen featuring full-bleed fleet artwork and Continue button
//

import SwiftUI

public struct SplashScreenView: View {
    public var onContinue: () -> Void
    
    public init(onContinue: @escaping () -> Void) {
        self.onContinue = onContinue
    }
    
    public var body: some View {
        ZStack {
            // Background Sky Color Fallback
            Color(red: 0.13, green: 0.44, blue: 0.51)
                .ignoresSafeArea()
            
            // Full-bleed Artwork
            Group {
                #if SWIFT_PACKAGE
                if let uiImage = UIImage(named: "splash_graphic", in: .module, with: nil) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else if let uiImage = UIImage(named: "splash_graphic") {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else {
                    Image("splash_graphic")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                }
                #else
                Image("splash_graphic")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                #endif
            }
            .ignoresSafeArea()
            
            // Top Subtle Vignette
            VStack {
                LinearGradient(
                    colors: [Color.black.opacity(0.4), Color.clear],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 120)
                .ignoresSafeArea(edges: .top)
                Spacer()
            }
            
            // Bottom Accessible Vignette
            VStack {
                Spacer()
                LinearGradient(
                    colors: [Color.clear, Color(red: 0.02, green: 0.09, blue: 0.13).opacity(0.8), Color(red: 0.02, green: 0.09, blue: 0.13).opacity(0.96)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 360)
                .ignoresSafeArea(edges: .bottom)
            }
            
            // Content Layout
            VStack {
                // Top Status Pill
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color(red: 0.18, green: 0.54, blue: 0.34))
                        .frame(width: 8, height: 8)
                    Text("GHANA FLEET OS • v1.0")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .tracking(0.8)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(Color(red: 0.02, green: 0.13, blue: 0.17).opacity(0.85))
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.25), radius: 8, x: 0, y: 4)
                .padding(.top, 16)
                
                Spacer()
                
                // Bottom Action Tray
                VStack(spacing: 16) {
                    VStack(spacing: 6) {
                        Text("ProMove Fleet Control")
                            .font(.system(size: 26, weight: .heavy))
                            .foregroundColor(.white)
                            .shadow(color: Color.black.opacity(0.45), radius: 6, x: 0, y: 2)
                        
                        Text("Ghana's digital operating system for trotros, taxis, and commercial transport")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(Color.white.opacity(0.9))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .padding(.horizontal, 12)
                            .shadow(color: Color.black.opacity(0.45), radius: 4, x: 0, y: 1)
                    }
                    
                    // Tactile Continue Button
                    Button(action: onContinue) {
                        HStack(spacing: 10) {
                            Text("Continue")
                                .font(.system(size: 17, weight: .bold))
                            Image(systemName: "arrow.right")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(ProMoveColors.deepSea)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.white.opacity(0.25), lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.4), radius: 14, x: 0, y: 6)
                    }
                    
                    Text("Signed in • Opens Fleet Dashboard")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color.white.opacity(0.75))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 28)
            }
        }
    }
}
