# ProMove Fleet — iOS Native Shell

Native iOS Application built with **Swift 5.9+** and **SwiftUI** (iOS 17+) rendering the complete, full-featured **ProMove Mobile Web Platform** with native splash screen, edge-to-edge safe area integration, persistent Clerk authentication, and hardware-accelerated GPS telemetry.

---

## 📱 Architecture & Highlights

- **Native Mobile Shell:** Powered by high-performance `WKWebView` (`MobileWebView.swift`), featuring the exact responsive UI, live Neon Postgres data, Clerk authentication, live radar tracking, offline capabilities, and fleet management tools of the mobile web app.
- **Native Mobile Splash Screen:** Full-bleed Ghana fleet graphic artwork with dynamic gradient overlay, live status badge (`GHANA FLEET OS • v1.0`), and tactile **"Continue"** button leading directly into the live mobile application.
- **Bi-Directional Authentication & Cookie Persistence:** Shares `WKWebsiteDataStore` for seamless Clerk session management across app restarts.
- **Hardware & Sensor Integration:**
  - `WKUIDelegate` hooks for camera inspections and document uploads.
  - Native geolocation prompt delegation for driver speed and live map tracking.
- **UX & Gesture Enhancements:**
  - Pull-to-refresh (`UIRefreshControl`).
  - Native swipe-to-navigate back and forward gestures (`allowsBackForwardNavigationGestures = true`).
  - Top loading progress indicator.
  - Offline / Connection retry fallback card styled with ProMove Deep Sea theme.

---

## 📁 Directory Structure

```
ios/
├── Package.swift                  # Swift Package Manager configuration
└── ProMove/
    ├── App/
    │   └── ProMoveApp.swift       # App root: SplashScreenView -> MobileWebView
    ├── Views/
    │   ├── SplashScreenView.swift # Native mobile splash screen
    │   └── MobileWebView.swift    # Full WKWebView mobile engine container
    ├── Design/
    │   └── ProMoveTheme.swift     # Brand colors and typography tokens
    ├── Core/
    │   └── Constants.swift        # Local and production endpoints
    ├── Resources/
    │   └── splash_graphic.png     # High-resolution mobile fleet artwork
    └── Info.plist                 # ATS, camera, and background location permissions
```

---

## 🚀 Running with Xcode

1. Open Xcode on macOS (14.0+).
2. Open `ios/Package.swift` or the Xcode workspace.
3. Select an iOS Simulator (e.g., iPhone 15 / 16 Pro) or a connected physical iPhone.
4. Press **Cmd + R** to build and run.
