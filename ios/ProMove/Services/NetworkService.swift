//
//  NetworkService.swift
//  ProMove Fleet
//
//  URLSession async/await client communicating with ProMove Next.js backend
//

import Foundation

public final class NetworkService {
    public static let shared = NetworkService()
    
    public var baseUrl: String {
        get {
            UserDefaults.standard.string(forKey: "pm_api_base_url") ?? Constants.defaultApiBaseUrl
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "pm_api_base_url")
        }
    }
    
    private let session: URLSession
    private let jsonDecoder: JSONDecoder
    private let jsonEncoder: JSONEncoder
    
    public init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 8.0
        configuration.timeoutIntervalForResource = 15.0
        self.session = URLSession(configuration: configuration)
        self.jsonDecoder = JSONDecoder()
        self.jsonEncoder = JSONEncoder()
    }
    
    /// Sends a real-time GPS telemetry ping to /api/gps/telemetry
    public func sendTelemetry(ping: TelemetryPing) async throws -> TelemetryResponse {
        guard let url = URL(string: "\(baseUrl)/api/gps/telemetry") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try jsonEncoder.encode(ping)
        
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let errorMsg = String(data: data, encoding: .utf8) ?? "HTTP Error"
            throw NSError(domain: "ProMoveNetwork", code: (response as? HTTPURLResponse)?.statusCode ?? 500, userInfo: [NSLocalizedDescriptionKey: errorMsg])
        }
        
        return try jsonDecoder.decode(TelemetryResponse.self, data: data)
    }
    
    /// Fetches all active vehicle positions from /api/gps/positions
    public func fetchPositions() async throws -> [FleetPosition] {
        guard let url = URL(string: "\(baseUrl)/api/gps/positions") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let parsed = try jsonDecoder.decode(PositionsApiResponse.self, data: data)
        return parsed.positions
    }
    
    /// Checks server connectivity and database status
    public func checkHealth() async -> Bool {
        guard let url = URL(string: "\(baseUrl)/api/system-status") else { return false }
        do {
            let (_, response) = try await session.data(from: url)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch {
            return false
        }
    }
}
