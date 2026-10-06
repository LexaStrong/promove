# ProMove Fleet — Android Native App

Native Android Application built with **Kotlin** and **Jetpack Compose** for commercial fleet management in Ghana (Trotros, Taxis, Intercity Buses, Haulage/Tippers, and Delivery Vans).

---

## 📱 Tech Stack & Architecture

- **Language:** Kotlin 2.3+
- **UI Toolkit:** Jetpack Compose (Material 3) with custom ProMove design tokens
- **Architecture:** Clean Architecture + Unidirectional Data Flow (StateFlow / Coroutines)
- **Networking:** `ProMoveNetworkClient` (HTTP/JSON serialization targeting `/api/gps/telemetry`, `/api/gps/positions`, and `/api/system-status`)
- **Location Services:** Android `LocationManager` + Foreground Service (`LocationTrackingService`) with persistent status notification for 24/7 background driver telemetry
- **Ghana Compliance:**
  - **DVLA Plate Validator (`GhanaPlateValidator`):** Validates all 16 Ghanaian regional prefixes (`GR`, `GW`, `GS`, `GE`, `GT`, `GN`, `AS`, `BA`, `CR`, `ER`, `VR`, `WR`, `NR`, `UE`, `UW`, `DV`, `DP`) and enforces Act 843 conventions.
  - **Curated Commercial Vehicle Catalog:** Direct dropdown selection for Ghana's most popular commercial vehicles (Toyota HiAce, Hyundai i10, Mercedes Sprinter, HOWO Sinotruk, Suzuki Super Carry, DAF CF, etc.).
  - **Ghana Cedi & Pesewas Currency Precision:** Exact integer pesewas calculations.

---

## 📁 Directory Structure

```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/promove/fleet/
│           ├── MainActivity.kt                # App entry point & runtime permissions
│           ├── core/
│           │   ├── Constants.kt               # Endpoints, Ghana regions, intervals
│           │   └── GhanaPlateValidator.kt     # DVLA plate validation regex & logic
│           ├── data/
│           │   ├── model/
│           │   │   ├── Vehicle.kt             # Vehicle, Type, Status, Fuel
│           │   │   ├── VehicleCatalog.kt      # Curated Ghana commercial catalog
│           │   │   └── TelemetryPing.kt       # GPS coordinates, speed, battery
│           │   ├── network/
│           │   │   └── ProMoveNetworkClient.kt# Backend API client
│           │   └── repository/
│           │       └── FleetRepository.kt     # Central fleet StateFlow & sync
│           ├── service/
│           │   └── LocationTrackingService.kt # Foreground GPS transmitter service
│           ├── theme/
│           │   ├── Color.kt                   # Brand tokens (Navy, Sea Blue, Amber)
│           │   └── Theme.kt                   # Light & dark theme definitions
│           └── ui/
│               ├── MainAppScaffold.kt         # Root Bottom Navigation scaffold
│               ├── components/
│               │   └── ProMoveComponents.kt   # DVLA plate badge, Status chip, Metric card
│               └── screens/
│                   ├── DashboardScreen.kt     # Overview KPIs & vehicle table
│                   ├── VehiclesScreen.kt      # Filterable vehicle roster & FAB
│                   ├── AddVehicleDialog.kt    # Curated make/model picker & DVLA validator
│                   ├── DriverTrackerScreen.kt # High-precision GPS speedometer HUD
│                   └── FleetMapScreen.kt      # Interactive fleet radar & live pin viewer
└── build.gradle.kts
```

---

## 🚀 Running & Building

### Prerequisites
- JDK 17+ or JDK 21+
- Android SDK 26+ (Target SDK 36)

### Build Debug APK
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device or Emulator
```bash
./gradlew installDebug
```
or via the Android CLI:
```bash
android run --device=<device_id>
```
