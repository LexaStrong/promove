# ProMove Fleet — iOS Native App

Native iOS Application built with **Swift** and **SwiftUI** for commercial fleet management in Ghana (Trotros, Taxis, Intercity Coaches, Haulage Tippers, and Delivery Vans).

---

## 📱 Tech Stack & Architecture

- **Language:** Swift 5.9+ / Swift 6
- **UI Framework:** SwiftUI (iOS 17+)
- **Architecture:** MVVM + Clean Architecture (`ObservableObject` / `@MainActor` state stores)
- **Networking:** `URLSession` async/await client (`NetworkService`) connecting directly to ProMove backend (`/api/gps/telemetry`, `/api/gps/positions`, `/api/system-status`)
- **Location Services:** `CoreLocation` (`LocationManager`) with `allowsBackgroundLocationUpdates = true` and `showsBackgroundLocationIndicator = true`
- **Mapping:** Apple `MapKit` (`Map`) with custom styled annotations and callouts
- **Ghana DVLA Compliance:**
  - **Ghana DVLA Plate Validator (`GhanaPlateValidator`):** Validates all Ghanaian region prefixes (`GR`, `GW`, `GS`, `GE`, `GT`, `AS`, `BA`, `CR`, `ER`, `VR`, `WR`, `NR`, `UE`, `UW`, `DV`, `DP`) with live plate formatting (`GW 2412-23`).
  - **Curated Vehicle Catalog (`CuratedVehicleCatalog`):** Native Pickers populated with makes and models tailored for Ghana transport.

---

## 📁 Directory Structure

```
ios/
├── Package.swift
└── ProMove/
    ├── App/
    │   └── ProMoveApp.swift           # SwiftUI App entry point
    ├── Core/
    │   ├── Constants.swift            # Backend URLs, default coordinates
    │   └── GhanaPlateValidator.swift  # DVLA plate validation engine
    ├── Models/
    │   ├── Vehicle.swift              # Vehicle domain model
    │   ├── VehicleCatalog.swift       # Curated Ghana commercial catalog
    │   └── TelemetryPing.swift        # GPS ping & position models
    ├── Services/
    │   ├── LocationManager.swift      # CoreLocation background streamer
    │   ├── NetworkService.swift       # URLSession async API client
    │   └── FleetStore.swift           # Central state manager & telemetry loop
    ├── Design/
    │   └── ProMoveTheme.swift         # ProMove brand color tokens & styles
    ├── Components/
    │   ├── DVLAPlateView.swift        # Realistic Ghana DVLA plate badge
    │   ├── StatusBadgeView.swift      # Active/Idle/Maint pill badge
    │   └── MetricTileView.swift       # Dashboard metric card
    ├── Views/
    │   ├── MainTabView.swift          # Root TabView navigation
    │   ├── DashboardView.swift        # Overview KPIs & vehicle roster
    │   ├── VehiclesListView.swift     # Filterable vehicle list (Vehicle, Plate, Status)
    │   ├── AddVehicleSheet.swift      # Curated make/model picker & DVLA input
    │   ├── DriverTrackerView.swift    # Driver Mode GPS speedometer HUD
    │   └── FleetMapView.swift         # Interactive MapKit fleet live map
    └── Info.plist                     # Background location permissions
```

---

## 🚀 Running with Xcode

1. Open Xcode on macOS.
2. Select **File > Open** and choose the `ios` directory or open `Package.swift`.
3. Select an iOS Simulator (e.g., iPhone 15 / 16) or a connected physical iPhone.
4. Press **Cmd + R** to build and run.
