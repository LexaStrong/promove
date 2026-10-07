# ProMove Fleet — Android Native Shell

Native Android Application built with **Kotlin 2.3+** and **Jetpack Compose** rendering the complete, full-featured **ProMove Mobile Web Platform** with native splash screen, edge-to-edge system bars, bi-directional Clerk session persistence, hardware-accelerated GPS telemetry, and native file chooser capabilities.

---

## 📱 Architecture & Highlights

- **Native Mobile Shell:** Powered by high-performance Android `WebView` (`ProMoveWebView.kt`), providing the exact responsive UI, live Neon Postgres data, Clerk authentication, live radar tracking, offline capabilities, and fleet management tools of the mobile web app.
- **Native Mobile Splash Screen:** Full-bleed Ghana fleet graphic artwork with dynamic gradient overlay, live status badge (`GHANA FLEET OS • v1.0`), and tactile **"Continue"** button leading directly into the live mobile application.
- **Session & Cookie Persistence:** Bi-directional cookie synchronization via Android `CookieManager` preserving Clerk tokens and tenant sessions across app restarts.
- **Hardware & Sensor Integration:**
  - Integrated file chooser launcher for vehicle inspection photos, DVLA documents, and driver license uploads.
  - Native geolocation prompt delegation for driver speed and live map tracking.
- **UX & Gesture Enhancements:**
  - Hardware back button interception for natural web navigation.
  - Linear loading progress indicator at the top of the viewport.
  - Offline / Connection retry fallback card styled with ProMove Deep Sea theme.

---

## 📁 Directory Structure

```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── res/drawable/splash_graphic.png    # High-resolution mobile fleet artwork
│       └── java/com/promove/fleet/
│           ├── MainActivity.kt                # App entry point & splash-to-webview router
│           ├── core/
│           │   ├── Constants.kt               # Local emulator (10.0.2.2) and prod endpoints
│           │   └── GhanaPlateValidator.kt     # DVLA plate validation regex & logic
│           ├── theme/
│           │   ├── Color.kt                   # Brand tokens (Navy, Sea Blue, Amber)
│           │   └── Theme.kt                   # Theme definitions
│           └── ui/
│               ├── ProMoveWebView.kt          # Full WebView mobile engine container
│               └── screens/
│                   └── SplashScreen.kt        # Native mobile splash screen
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
The APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device or Emulator
```bash
./gradlew installDebug
```
