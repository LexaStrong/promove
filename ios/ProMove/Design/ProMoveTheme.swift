//
//  ProMoveTheme.swift
//  ProMove Fleet
//
//  Brand Tokens & Styling for ProMove iOS
//

import SwiftUI

public enum ProMoveColors {
    /// Primary Brand Navy (#0B4F6C)
    public static let deepSea = Color(red: 11/255, green: 79/255, blue: 108/255)
    
    /// Accent Ocean Blue (#1B7A9E)
    public static let seaBlue = Color(red: 27/255, green: 122/255, blue: 158/255)
    
    /// Soft Ice Surface (#EDF5F8)
    public static let iceSurface = Color(red: 237/255, green: 245/255, blue: 248/255)
    
    /// Electric Teal Accent (#01BAEF)
    public static let electricTeal = Color(red: 1/255, green: 186/255, blue: 239/255)
    
    /// Ghana Gold / Warning Amber (#F59E0B)
    public static let ghanaAmber = Color(red: 245/255, green: 158/255, blue: 11/255)
    
    /// Success Green / Active (#10B981)
    public static let successGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
    
    /// Danger / Unavailable (#EF4444)
    public static let dangerRed = Color(red: 239/255, green: 68/255, blue: 68/255)
    
    /// Slate 900 Header Text (#0F172A)
    public static let textPrimary = Color(red: 15/255, green: 23/255, blue: 42/255)
    
    /// Slate 500 Secondary Text (#64748B)
    public static let textSecondary = Color(red: 100/255, green: 116/255, blue: 139/255)
    
    /// Subtle Border (#E2E8F0)
    public static let borderSubtle = Color(red: 226/255, green: 232/255, blue: 240/255)
    
    /// Card Background
    public static let cardBackground = Color(UIColor.systemBackground)
    
    /// Screen Grouped Background
    public static let groupedBackground = Color(UIColor.systemGroupedBackground)
}

public struct CardModifier: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .background(ProMoveColors.cardBackground)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(ProMoveColors.borderSubtle, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
    }
}

public extension View {
    func proMoveCard() -> some View {
        self.modifier(CardModifier())
    }
}
