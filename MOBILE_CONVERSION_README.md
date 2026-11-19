# Kingdom Blast — Mobile App Conversion (Capacitor)

## Project Status

| Item | Status | Notes |
|------|--------|-------|
| Source code ported | ✅ Complete | All React + TypeScript files from GitHub repo |
| Package.json fixes | ✅ Complete | TS version fixed (^5.6.0), alias path fixed (./src) |
| Capacitor config | ✅ Complete | capacitor.config.ts created |
| Android native project | ✅ Complete | Full Gradle project structure created |
| App icons & splash | ✅ Complete | SVG placeholders created |
| Offline/PWA support | ✅ Complete | vite-plugin-pwa configured |
| Back button + lifecycle | ✅ Complete | App plugin integration in main.tsx |
| Mobile CSS optimizations | ✅ Complete | touch-action, safe-area, no-scroll |
| Bug fixes | ✅ Complete | Extra moves now adds moves (not lives), debounced save |
| npm install | ❌ Blocked | No internet access in this environment |
| Production build | ❌ Blocked | Cannot run without node_modules |
| APK/AAB build | ❌ Blocked | Cannot run without Android SDK |

---

## Blocker Report

**Cannot run `npm install` — no internet access.**

The environment is offline. All package downloads (npm, Capacitor, Android SDK, Gradle) will fail. To proceed:

1. Move this project to a machine with internet access
2. Run `npm install --legacy-peer-deps`
3. Run `npx cap add android` (and `npx cap add ios` on macOS)
4. Run `npm run build && npx cap copy && npx cap sync android`
5. Build APK/AAB via Android Studio or Gradle CLI

**Cannot generate APK/AAB — Android SDK not installed.**

No `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or Gradle wrapper binary is present. The APK/AAB locations below are where they will be *after* a successful build.

---

## Updated Project Architecture

```
royal-match/
├── capacitor.config.ts          # Capacitor configuration
├── index.html                   # Web entry point (VWA meta tags)
├── package.json                 # Fixed deps (TS ^5.6.0, Capacitor ^7, PWA)
├── tsconfig.json                # Fixed alias path (@/* → ./src/*)
├── vite.config.ts               # PWA plugin + alias fix + vendor chunks
├── .env.example                 # Environment variables
├── .gitignore                   # Added android/, ios/
├── metadata.json                # App metadata
├── pwa-192.svg                  # PWA icon placeholder
├── pwa-512.svg                  # PWA icon placeholder
├── apple-touch-icon.svg         # iOS touch icon placeholder
├── maskable-icon.svg            # Maskable icon placeholder
├── src/
│   ├── main.tsx                 # React root + Capacitor plugin init
│   ├── App.tsx                  # Game shell (fixed extra-moves bug, debounced save)
│   ├── index.css                # Mobile CSS (touch-action, safe-area, no-scroll)
│   ├── types/game.ts            # TypeScript interfaces
│   ├── engine/match3.ts         # Match-3 engine (unchanged)
│   ├── data/levels.ts           # 22 levels (unchanged)
│   ├── data/kingdom.ts          # Restoration projects + daily rewards
│   ├── storage/progress.ts      # localStorage persistence
│   ├── utils/assetLoader.ts     # Image preloading
│   ├── audio/soundEngine.ts     # Web Audio API sound engine
│   ├── components/              # All game components (unchanged logic)
│   │   ├── BrandLogo.tsx
│   │   ├── GemIcons.tsx
│   │   ├── Skeletons.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── TitleScreen.tsx
│   │   ├── LevelMapScreen.tsx
│   │   ├── PuzzleBoardScreen.tsx
│   │   ├── KingdomRestorationScreen.tsx
│   │   ├── TopHud.tsx
│   │   └── Modals.tsx
│   └── assets/images/           # Game artwork (copied from GitHub)
├── android/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradle.properties
│   ├── gradle/wrapper/gradle-wrapper.properties
│   └── app/
│       ├── build.gradle
│       ├── src/main/AndroidManifest.xml
│       ├── src/main/java/com/royalmatch/kingdomblast/MainActivity.kt
│       ├── src/main/res/values/strings.xml
│       ├── src/main/res/values/themes.xml
│       ├── src/main/res/values/styles.xml
│       ├── src/main/res/values/colors.xml
│       ├── src/main/res/drawable/splash.xml
│       ├── src/main/res/drawable/ic_launcher.xml
│       ├── src/main/res/drawable/ic_launcher_round.xml
│       ├── src/main/res/drawable/ic_launcher_foreground.xml
│       └── src/main/res/mipmap-*/ic_launcher.png (placeholders needed)
└── ios/                         # Created by `npx cap add ios` (macOS only)
```

---

## Capacitor Configuration

**File:** `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.royalmatch.kingdomblast',
  appName: 'Kingdom Blast',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#020617',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
    App: {
      launchAutoHide: true,
    },
  },
};

export default config;
```

**Package ID:** `com.royalmatch.kingdomblast` (reverse-domain identifier)

---

## Android Application Configuration

- **App Name:** Kingdom Blast
- **Package ID:** `com.royalmatch.kingdomblast`
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)
- **Orientation:** Portrait (locked)
- **Launch mode:** singleTop
- **Window soft input:** adjustResize
- **Full-screen immersive:** Yes (status bar + navigation bar styled)
- **Hardware acceleration:** Enabled
- **Large heap:** Enabled (for image assets)

### Android Back Button Handling

- TITLE screen: exits app
- MAP screen: exits app
- PLAY screen: handled by in-game Pause modal (Esc key also works)
- All other screens: Capacitor default behavior

### App Lifecycle

- `appStateChange` listener: pauses music when app backgrounds, resumes when foregrounded
- `backButton` listener: custom exit logic on TITLE/MAP

---

## Native Splash Screen

- **File:** `android/app/src/main/res/drawable/splash.xml` (layer-list)
- **Background color:** `#020617` (slate-950)
- **Foreground:** App icon centered
- **Duration:** 2000ms auto-hide
- **Full-screen:** Yes, immersive mode enabled
- **No white flash:** Window background set to splash drawable in theme

The in-game `LoadingScreen` component remains separate and shows after the native splash dismisses.

---

## Mobile Gameplay Optimizations

1. **Touch interactions:** `touch-action: manipulation` on all buttons; `user-select: none` during gameplay
2. **No accidental scrolling:** `overscroll-behavior: none` on html/body; `touch-action: none` on game board container
3. **No zoom:** `user-scalable=no` in viewport meta; `touch-action: manipulation` on interactive elements
4. **Touch targets:** Minimum 44x44px on all buttons
5. **Responsive board:** CSS grid adapts; board max-width 520px, centered
6. **Safe areas:** `pt-safe`, `pb-safe`, `px-safe` utilities using `env(safe-area-inset-*)`
7. **No horizontal overflow:** `overflow-x: hidden` on body
8. **Android gesture navigation:** Edge-to-edge with translucent navigation bar

Desktop mouse controls are preserved unchanged.

---

## Offline Support

1. **PWA:** `vite-plugin-pwa` configured with `registerType: 'autoUpdate'`
2. **Local assets:** All 4 JPG images bundled in `dist/src/assets/images/` and copied via `copy-unbundled-src-assets` plugin
3. **Service worker:** Workbox caches all JS, CSS, HTML, images
4. **Local persistence:** `localStorage` saves coins, stars, lives, unlocked levels, boosters, restoration progress
5. **Graceful offline startup:** App loads entirely from cached assets; no mandatory online APIs
6. **Restore progress:** `loadProgress()` reads from localStorage on every launch

---

## Build and Release

### Android

After running on a machine with internet + Android SDK:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Add Capacitor Android platform
npx cap add android

# Build web assets
npm run build

# Copy web assets to native project
npx cap copy

# Sync Capacitor plugins
npx cap sync android

# Open in Android Studio
npx cap open android
```

**Build outputs (after successful Gradle build):**

| Artifact | Location |
|----------|----------|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` |
| Google Play AAB | `android/app/build/outputs/bundle/release/app-release.aab` |

**Release signing:** Configure `signingConfigs.release` in `android/app/build.gradle` with your keystore. Currently uses `signingConfigs.debug` for both debug and release.

### iOS

```bash
# macOS only, requires Xcode
npx cap add ios
npx cap open ios
```

iOS app signing, provisioning profiles, and App Store Connect configuration must be done in Xcode on a Mac. Cannot be verified on this Windows environment.

---

## Testing Checklist

| Test | Status | Notes |
|------|--------|-------|
| Native app launches | ⏳ Pending | Requires Android device/emulator |
| Splash screen works | ⏳ Pending | Requires native build |
| Main menu loads | ⏳ Pending | Requires native build |
| Puzzle board works | ⏳ Pending | Requires native build |
| Touch controls work | ⏳ Pending | Requires mobile device |
| All 22 levels accessible | ⏳ Pending | Requires native build |
| Progress saves correctly | ⏳ Pending | localStorage on device |
| Offline gameplay works | ⏳ Pending | Requires airplane mode test |
| Android back button works | ⏳ Pending | Requires native build |
| App resumes after minimizing | ⏳ Pending | Requires native build |
| No black screen | ⏳ Pending | Requires native build |
| TypeScript check (`npm run lint`) | ❌ Blocked | No node_modules |
| Production build (`npm run build`) | ❌ Blocked | No node_modules |

---

## Remaining Tasks for Publishing

### Immediate (requires internet + Android SDK)

1. Run `npm install --legacy-peer-deps`
2. Run `npx cap add android`
3. Generate real PNG icons from the SVG placeholders (192x192, 512x512, adaptive icon layers)
4. Run `npm run build`
5. Run `npx cap copy && npx cap sync android`
6. Build APK/AAB via Android Studio or `./gradlew assembleRelease`
7. Test on physical Android device

### App Store Publishing

8. **Google Play Console:** Create app, upload AAB, complete store listing
9. **App Store Connect (iOS):** Requires Mac + Xcode + Apple Developer account
10. **Privacy Policy:** Required for both stores
11. **Age rating:** Complete questionnaire
12. **App signing:** Generate production keystore, configure release signing

### Known Bugs Fixed in This Conversion

| Bug | Fix |
|-----|-----|
| `handleBuyExtraMoves` added a life instead of moves | Now deducts 100 coins and sets `extraMovesSignal` (adds 5 moves via existing PuzzleBoardScreen effect) |
| Save on every progress change (localStorage spam) | Debounced save with 1000ms timeout |
| TypeScript version `^7.0.2` doesn't exist | Changed to `^5.6.0` |
| Vite alias `@` pointed to root `.` | Changed to `./src` |
| Package name `react-example` | Changed to `kingdom-blast` |

---

## File Locations Summary

- **Project root:** `C:\Users\jam kay\royal-match\`
- **Capacitor config:** `C:\Users\jam kay\royal-match\capacitor.config.ts`
- **Android manifest:** `C:\Users\jam kay\royal-match\android\app\src\main\AndroidManifest.xml`
- **Android build.gradle:** `C:\Users\jam kay\royal-match\android\app\build.gradle`
- **MainActivity:** `C:\Users\jam kay\royal-match\android\app\src\main\java\com\royalmatch\kingdomblast\MainActivity.kt`
- **Splash drawable:** `C:\Users\jam kay\royal-match\android\app\src\main\res\drawable\splash.xml`
- **Launcher icon:** `C:\Users\jam kay\royal-match\android\app\src\main\res\drawable\ic_launcher.xml`
- **Source code:** `C:\Users\jam kay\royal-match\src\`
