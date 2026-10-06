//
//  Constants.swift
//  ProMove Fleet
//
//  Ghana Commercial Fleet Management
//

import Foundation

enum Constants {
    /// Default local / staging backend URL for ProMove API
    static let defaultApiBaseUrl = "http://localhost:3000"
    
    /// Production / Remote API endpoint fallback
    static let fallbackApiBaseUrl = "https://promove.africa"
    
    /// Telemetry ping frequency in seconds
    static let telemetryIntervalSeconds: TimeInterval = 4.0
    
    /// Ghana standard currency symbol
    static let currencySymbol = "GH₵"
    
    /// Accra center coordinate for map default (Circle / Danquah / Ridge area)
    static let defaultAccraLatitude = 5.6037
    static let defaultAccraLongitude = -0.1870
}

/// Official Ghana DVLA Region and Special Prefixes
enum GhanaDVLARegion: String, CaseIterable, Identifiable {
    case greaterAccraEast = "GE"
    case greaterAccraCentral = "GR"
    case greaterAccraWest = "GW"
    case greaterAccraSouth = "GS"
    case greaterAccraTema = "GT"
    case greaterAccraNorth = "GN"
    case ashantiSouth = "AS"
    case ashantiEast = "AE"
    case ashantiWest = "AW"
    case bonoSunyani = "BA"
    case centralRegion = "CR"
    case easternRegion = "ER"
    case voltaRegion = "VR"
    case westernRegion = "WR"
    case northernTamale = "NR"
    case upperEast = "UE"
    case upperWest = "UW"
    case dealerVehicle = "DV"
    case dealerPlate = "DP"
    
    var id: String { rawValue }
    
    var regionName: String {
        switch self {
        case .greaterAccraEast: return "Greater Accra (East)"
        case .greaterAccraCentral: return "Greater Accra (Central)"
        case .greaterAccraWest: return "Greater Accra (West - Weija/Kasoa)"
        case .greaterAccraSouth: return "Greater Accra (South)"
        case .greaterAccraTema: return "Tema Metropolitan"
        case .greaterAccraNorth: return "Greater Accra (North - Amasaman)"
        case .ashantiSouth: return "Ashanti (Kumasi South)"
        case .ashantiEast: return "Ashanti (Kumasi East)"
        case .ashantiWest: return "Ashanti (Kumasi West)"
        case .bonoSunyani: return "Bono (Sunyani)"
        case .centralRegion: return "Central (Cape Coast / Kasoa)"
        case .easternRegion: return "Eastern (Koforidua)"
        case .voltaRegion: return "Volta (Ho)"
        case .westernRegion: return "Western (Sekondi-Takoradi)"
        case .northernTamale: return "Northern (Tamale)"
        case .upperEast: return "Upper East (Bolgatanga)"
        case .upperWest: return "Upper West (Wa)"
        case .dealerVehicle: return "DVLA Trade Plate (DV)"
        case .dealerPlate: return "DVLA Defective Plate (DP)"
        }
    }
}
