//
//  StatusBadgeView.swift
//  ProMove Fleet
//
//  Clean status badge for Active, Idle, Maintenance, Unavailable
//

import SwiftUI

public struct StatusBadgeView: View {
    public let status: VehicleStatus
    
    public init(status: VehicleStatus) {
        self.status = status
    }
    
    private var badgeColor: (bg: Color, text: Color, dot: Color) {
        switch status {
        case .active:
            return (
                bg: Color(red: 220/255, green: 252/255, blue: 231/255),
                text: Color(red: 22/255, green: 101/255, blue: 52/255),
                dot: Color(red: 22/255, green: 163/255, blue: 74/255)
            )
        case .idle:
            return (
                bg: Color(red: 224/255, green: 242/255, blue: 254/255),
                text: Color(red: 7/255, green: 89/255, blue: 133/255),
                dot: Color(red: 14/255, green: 165/255, blue: 233/255)
            )
        case .maintenance:
            return (
                bg: Color(red: 254/255, green: 243/255, blue: 199/255),
                text: Color(red: 146/255, green: 64/255, blue: 14/255),
                dot: Color(red: 217/255, green: 119/255, blue: 6/255)
            )
        case .unavailable:
            return (
                bg: Color(red: 254/255, green: 226/255, blue: 226/255),
                text: Color(red: 153/255, green: 27/255, blue: 27/255),
                dot: Color(red: 220/255, green: 38/255, blue: 38/255)
            )
        }
    }
    
    public var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(badgeColor.dot)
                .frame(width: 6, height: 6)
            
            Text(status.displayName)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(badgeColor.text)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(badgeColor.bg)
        .cornerRadius(12)
    }
}
