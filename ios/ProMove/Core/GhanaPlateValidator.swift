//
//  GhanaPlateValidator.swift
//  ProMove Fleet
//
//  Ghana DVLA (Driver and Vehicle Licensing Authority) Plate Number Validator
//  Compliant with Act 843 and DVLA registration conventions:
//  - Standard: [Region Code 2 letters] [1-4 digits] - [2 digit Year]
//    e.g. "GW 2412-23", "GR-4512-24", "AS 8821-22", "BA 104-21"
//  - Trade / Defective: "DV 1234-23", "DP 5678-24"
//

import Foundation

struct GhanaPlateValidationResult {
    let isValid: Bool
    let formattedPlate: String
    let regionCode: String?
    let regionName: String?
    let numberPart: String?
    let yearPart: String?
    let errorMessage: String?
}

struct GhanaPlateValidator {
    
    private static let validPrefixes: [String: String] = [
        "GR": "Greater Accra (Central)",
        "GE": "Greater Accra (East)",
        "GW": "Greater Accra (West - Weija/Kasoa)",
        "GS": "Greater Accra (South)",
        "GT": "Tema Metropolitan",
        "GN": "Greater Accra (North - Amasaman)",
        "AS": "Ashanti (Kumasi South)",
        "AE": "Ashanti (Kumasi East)",
        "AW": "Ashanti (Kumasi West)",
        "BA": "Bono (Sunyani)",
        "BE": "Bono East (Techiman)",
        "BW": "Bono (Berekum / West)",
        "CR": "Central (Cape Coast)",
        "ER": "Eastern (Koforidua)",
        "VR": "Volta (Ho)",
        "WR": "Western (Sekondi-Takoradi)",
        "NR": "Northern (Tamale)",
        "UE": "Upper East (Bolgatanga)",
        "UW": "Upper West (Wa)",
        "OT": "Oti (Dambai)",
        "WN": "Western North (Sefwi Wiawso)",
        "NE": "North East (Nalerigu)",
        "SR": "Savannah (Damongo)",
        "AH": "Ahafo (Goaso)",
        "DV": "DVLA Trade Plate",
        "DP": "DVLA Defective Plate"
    ]
    
    /// Sanitizes and validates a given plate string
    static func validate(_ rawInput: String) -> GhanaPlateValidationResult {
        let cleaned = rawInput
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        
        if cleaned.isEmpty {
            return GhanaPlateValidationResult(
                isValid: false,
                formattedPlate: "",
                regionCode: nil,
                regionName: nil,
                numberPart: nil,
                yearPart: nil,
                errorMessage: "Please enter a Ghana vehicle registration number"
            )
        }
        
        // Regex pattern: 2 letters, optional space or dash, 1 to 4 digits, optional space or dash, 2 digits (year)
        let pattern = #"^([A-Z]{2})[\s\-]?([0-9]{1,4})[\s\-]?([0-9]{2})$"#
        
        guard let regex = try? NSRegularExpression(pattern: pattern, options: []) else {
            return GhanaPlateValidationResult(
                isValid: false,
                formattedPlate: cleaned,
                regionCode: nil,
                regionName: nil,
                numberPart: nil,
                yearPart: nil,
                errorMessage: "Internal regex error"
            )
        }
        
        let range = NSRange(cleaned.startIndex..<cleaned.endIndex, in: cleaned)
        guard let match = regex.firstMatch(in: cleaned, options: [], range: range) else {
            return GhanaPlateValidationResult(
                isValid: false,
                formattedPlate: cleaned,
                regionCode: nil,
                regionName: nil,
                numberPart: nil,
                yearPart: nil,
                errorMessage: "Invalid plate format. Expected e.g. GW 2412-23 or GR 4512-24"
            )
        }
        
        guard let prefixRange = Range(match.range(at: 1), in: cleaned),
              let numRange = Range(match.range(at: 2), in: cleaned),
              let yearRange = Range(match.range(at: 3), in: cleaned) else {
            return GhanaPlateValidationResult(
                isValid: false,
                formattedPlate: cleaned,
                regionCode: nil,
                regionName: nil,
                numberPart: nil,
                yearPart: nil,
                errorMessage: "Could not parse plate components"
            )
        }
        
        let prefix = String(cleaned[prefixRange])
        let number = String(cleaned[numRange])
        let year = String(cleaned[yearRange])
        
        guard let regionName = validPrefixes[prefix] else {
            return GhanaPlateValidationResult(
                isValid: false,
                formattedPlate: "\(prefix) \(number)-\(year)",
                regionCode: prefix,
                regionName: nil,
                numberPart: number,
                yearPart: year,
                errorMessage: "'\(prefix)' is not a recognized DVLA region code in Ghana"
            )
        }
        
        // Standard official display format: "GW 2412-23"
        let formatted = "\(prefix) \(number)-\(year)"
        
        return GhanaPlateValidationResult(
            isValid: true,
            formattedPlate: formatted,
            regionCode: prefix,
            regionName: regionName,
            numberPart: number,
            yearPart: year,
            errorMessage: nil
        )
    }
}
