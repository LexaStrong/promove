//
//  LocationManager.swift
//  ProMove Fleet
//
//  CoreLocation background streaming manager for Driver Mode
//

import Foundation
import CoreLocation
import Combine

public final class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published public var currentLocation: CLLocation?
    @Published public var currentHeading: CLHeading?
    @Published public var speedKmh: Double = 0.0
    @Published public var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published public var isTracking: Bool = false
    @Published public var errorMessage: String?
    
    private let manager = CLLocationManager()
    
    public override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.distanceFilter = 5.0 // Update every 5 meters
        manager.headingFilter = 3.0 // Update every 3 degrees
        manager.pausesLocationUpdatesAutomatically = false
        
        // Allows GPS tracking when driver locks phone or switches to maps
        manager.allowsBackgroundLocationUpdates = true
        manager.showsBackgroundLocationIndicator = true
        
        self.authorizationStatus = manager.authorizationStatus
    }
    
    public func requestPermissions() {
        manager.requestAlwaysAuthorization()
    }
    
    public func startTracking() {
        requestPermissions()
        manager.startUpdatingLocation()
        manager.startUpdatingHeading()
        isTracking = true
    }
    
    public func stopTracking() {
        manager.stopUpdatingLocation()
        manager.stopUpdatingHeading()
        isTracking = false
        speedKmh = 0.0
    }
    
    // MARK: - CLLocationManagerDelegate
    
    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        DispatchQueue.main.async {
            self.authorizationStatus = manager.authorizationStatus
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let latest = locations.last else { return }
        
        DispatchQueue.main.async {
            self.currentLocation = latest
            
            // Speed in m/s converted to km/h (negative value means invalid)
            if latest.speed >= 0 {
                self.speedKmh = latest.speed * 3.6
            } else {
                self.speedKmh = 0.0
            }
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        DispatchQueue.main.async {
            self.currentHeading = newHeading
        }
    }
    
    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        DispatchQueue.main.async {
            self.errorMessage = error.localizedDescription
        }
    }
}
