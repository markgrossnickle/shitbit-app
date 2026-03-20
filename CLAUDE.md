# ShitBit App

## What Is This

The ShitBit mobile app is the companion client for the ShitBit smart scale. It connects to the hardware via Bluetooth Low Energy, records weigh-in sessions, and provides the social/sharing layer that makes ShitBit fun.

## Tech Stack

- **Framework**: React Native (Expo SDK 55, bare workflow for BLE access)
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based routing under `app/`)
- **BLE Library**: react-native-ble-plx v3
- **State Management**: Zustand v5
- **Navigation**: React Navigation v7 (via Expo Router)
- **Auth**: JWT-based (email/password) — backend at shitbit-web
- **API Client**: Native fetch with auth header injection
- **Token Storage**: expo-secure-store
- **Clipboard**: expo-clipboard
- **Date Formatting**: date-fns v4
- **Testing**: Jest + React Native Testing Library (to be set up)

## Architecture

```
/app                        # Expo Router file-based screens
  /_layout.tsx              # Root layout with auth guard
  /(tabs)/                  # Main tab navigator
    /_layout.tsx            # Tab bar config
    /index.tsx              # Dashboard (home)
    /logbook.tsx            # Session history with date grouping
    /leaderboard.tsx        # Friend rankings
    /profile.tsx            # User profile, achievements, settings
  /(auth)/                  # Auth flow (no tabs)
    /_layout.tsx            # Auth stack layout
    /login.tsx              # Login screen
    /register.tsx           # Registration screen
  /device.tsx               # BLE device management (modal)
  /+not-found.tsx           # 404 screen
  /+html.tsx                # Web HTML wrapper

/src
  /services
    /ble/                   # Bluetooth connection and data parsing
      types.ts              # BLE types, UUIDs, interfaces
      bleService.ts         # Real BLE service (react-native-ble-plx)
      mockBleService.ts     # Mock for dev without hardware
      index.ts              # Factory with mock/real switch
    /api/                   # Backend API client
      client.ts             # Base fetch client with auth injection
      auth.ts               # Login, register, getMe
      sessions.ts           # Session CRUD
      friends.ts            # Friend operations
      leaderboard.ts        # Leaderboard queries
      index.ts              # Re-exports
  /store/                   # Zustand state stores
    useAuthStore.ts         # Auth state and actions
    useSessionStore.ts      # Session data and stats
    useDeviceStore.ts       # BLE device connection state
    useFriendsStore.ts      # Friends and leaderboard data
    index.ts                # Re-exports
  /types/                   # TypeScript type definitions
    session.ts              # Session, SessionStats, ApiSession
    user.ts                 # User, AuthState, credentials
    friend.ts               # Friend, LeaderboardEntry
    achievement.ts          # Achievement types and IDs
    index.ts                # Re-exports
  /utils/
    shareEncoder.ts         # Wordle-style emoji grid encoder
  /theme/
    colors.ts               # Dark theme color palette
    spacing.ts              # Spacing, border radius, font sizes
    index.ts                # Re-exports

/components/                # Shared UI components (from Expo template)
/constants/                 # Legacy constants (wraps theme)
/assets/                    # Images, fonts
```

## Core Features

### BLE Connection
- Scan for nearby ShitBit devices
- Pair and persist device connection
- Receive session data (sit weight, stand weight, delta, timestamp)
- Handle reconnection and error states gracefully
- Mock BLE service for development without hardware
- Mock generates realistic fake data with configurable history

### Session Tracking
- Auto-log sessions received from the device
- Display current session result with tier indicator
- Store sessions locally with server sync
- Allow notes/tags on sessions

### History and Stats
- Scrollable session history with date grouping (SectionList)
- Stats: lifetime total, average, biggest single, current streak
- Pull-to-refresh

### Friends and Leaderboards
- Add friends by username
- Leaderboards: daily, weekly, all-time, biggest single
- Current user rank always visible

### ShitBit Share (Emoji Encoder)
- Generates a 3x3 emoji grid encoding session magnitude
- Grid fills from center outward using brown/yellow/green/purple squares
- 9 tiers from < 50g (1 cell) to 800g+ (full grid, LEGENDARY)
- Format: `ShitBit MM/DD [poop emoji]\n[3x3 grid]`
- Copy to clipboard via expo-clipboard

### Achievements
- Badge system for milestones, streaks, single sessions, social
- Type-safe achievement IDs

## Backend API

The app talks to shitbit-web. Currently mocked in all API modules (USE_MOCK = true).

Key endpoints:
- `POST /auth/login` and `POST /auth/register`
- `GET /auth/me` — current user profile
- `POST /sessions` and `GET /sessions`
- `GET /stats` — aggregated stats
- `GET /friends`, `POST /friends/add`, `DELETE /friends/:id`
- `GET /leaderboard/:type` — daily, weekly, alltime, biggest

## Development

### Prerequisites
- Node 18+
- iOS 15+ / Android 12+
- Xcode 15+ for iOS builds
- Android Studio for Android builds

### Running
```bash
npx expo start           # Start dev server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
```

Note: BLE features require a dev client build (`expo-dev-client`), not Expo Go.

### Key Commands
```bash
npx tsc --noEmit         # Type check
npx expo install [pkg]   # Install compatible dependency
```

### Guidelines
- All components are functional with hooks
- TypeScript strict mode — no `any` types
- BLE logic isolated in /src/services/ble/ (swappable mock/real)
- All API calls go through /src/services/api/, never directly from screens
- Stores in /src/store/ handle all state mutations
- Use @/ path alias (maps to project root)
- Dark theme only — all colors from /src/theme/
- Handle offline gracefully — queue sessions locally, sync when online
