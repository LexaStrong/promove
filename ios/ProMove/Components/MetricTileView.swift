//
//  MetricTileView.swift
//  ProMove Fleet
//
//  Dashboard KPI metric tile component
//

import SwiftUI

public struct MetricTileView: View {
    public let title: String
    public let value: String
    public let subtitle: String?
    public let systemImage: String
    public let iconColor: Color
    
    public init(
        title: String,
        value: String,
        subtitle: String? = nil,
        systemImage: String,
        iconColor: Color = ProMoveColors.seaBlue
    ) {
        self.title = title
        self.value = value
        self.subtitle = subtitle
        self.systemImage = systemImage
        self.iconColor = iconColor
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ProMoveColors.textSecondary)
                
                Spacer()
                
                ZStack {
                    Circle()
                        .fill(iconColor.opacity(0.12))
                        .frame(width: 28, height: 28)
                    
                    Image(systemName: systemImage)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(iconColor)
                }
            }
            
            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(ProMoveColors.textPrimary)
            
            if let sub = subtitle {
                Text(sub)
                    .font(.system(size: 11, weight: .regular))
                    .foregroundColor(ProMoveColors.textSecondary)
            }
        }
        .padding(14)
        .proMoveCard()
    }
}
