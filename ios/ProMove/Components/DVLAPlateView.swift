//
//  DVLAPlateView.swift
//  ProMove Fleet
//
//  Authentic Ghana DVLA reflective license plate badge
//

import SwiftUI

public struct DVLAPlateView: View {
    public let plateNumber: String
    public var isCompact: Bool = false
    
    public init(plateNumber: String, isCompact: Bool = false) {
        self.plateNumber = plateNumber
        self.isCompact = isCompact
    }
    
    public var body: some View {
        HStack(spacing: isCompact ? 4 : 6) {
            // Country ID tag
            VStack(spacing: 1) {
                // Miniature Ghana Flag: Red, Gold, Green with Black Star
                VStack(spacing: 0) {
                    Color.red.frame(height: 2)
                    Color.yellow.frame(height: 2)
                    Color.green.frame(height: 2)
                }
                .frame(width: isCompact ? 10 : 14, height: isCompact ? 6 : 7)
                .cornerRadius(1)
                
                Text("GH")
                    .font(.system(size: isCompact ? 7 : 9, weight: .black, design: .monospaced))
                    .foregroundColor(Color.black.opacity(0.85))
            }
            .padding(.trailing, 2)
            
            // Registration Plate Text
            Text(plateNumber.uppercased())
                .font(.system(size: isCompact ? 12 : 15, weight: .heavy, design: .monospaced))
                .foregroundColor(Color.black)
                .tracking(isCompact ? 0.5 : 1.0)
        }
        .padding(.horizontal, isCompact ? 6 : 10)
        .padding(.vertical, isCompact ? 3 : 5)
        .background(
            LinearGradient(
                colors: [Color(red: 254/255, green: 249/255, blue: 195/255), Color(red: 253/255, green: 224/255, blue: 71/255)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .cornerRadius(6)
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(Color.black, lineWidth: 1.5)
        )
        .shadow(color: Color.black.opacity(0.08), radius: 2, x: 0, y: 1)
    }
}
