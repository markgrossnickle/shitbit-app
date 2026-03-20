# ShitBit App

## What Is This

The ShitBit mobile app is the companion client for the ShitBit smart scale. It connects to the hardware via Bluetooth Low Energy, records weigh-in sessions, and provides the social/sharing layer that makes ShitBit fun.

## Tech Stack

- **Framework**: React Native (Expo bare workflow for BLE access)
- **Language**: TypeScript
- **BLE Library**: react-native-ble-plx
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Charts**: react-native-chart-kit or Victory Native
- **Auth**: Firebase Auth (email/password + Apple Sign-In + Google Sign-In)
- **API Client**: Axios or TanStack Query for server communication
- **Push Notifications**: Firebase Cloud Messaging
- **Testing**: Jest + React Native Testing Library

## Architecture

```
/src
  /screens          - Top-level screen components
  /components       - Reusable UI components
  /services
    /ble            - Bluetooth connection, device discovery, data parsing
    /api            - Backend API client
    /auth           - Authentication service
  /store            - Zustand stores (session, user, friends, settings)
  /hooks            - Custom React hooks
  /utils            - Helpers, formatters, emoji share encoder
  /types            - TypeScript type definitions
  /assets           - Images, fonts
  /navigation       - React Navigation config
```

## Core Features

### BLE Connection
- Scan for nearby ShitBit devices
- Pair and persist device connection
- Receive session data (sit weight, stand weight, delta, timestamp)
- Handle reconnection and error states gracefully
- Background BLE support where OS allows

### Session Tracking
- Auto-log sessions received from the device
- Display current session result with animation
- Allow users to add notes/tags to sessions
- Store sessions locally (SQLite or AsyncStorage) with server sync

### History and Stats
- Scrollable session history with date grouping
- Charts: daily/weekly/monthly trends, personal records
- Stats: lifetime total, average, biggest single, current streak

### Friends and Leaderboards
- Add friends by username or invite link
- Leaderboards: daily top, weekly top, all-time top, biggest single session
- Friend activity feed

### ShitBit Share
- Generate a Wordle-style emoji block that encodes session magnitude
- Tiers: light (1 block), moderate (2-3 blocks), heavy (4 blocks), legendary (5 blocks)
- Format: `ShitBit 03/19 [emoji blocks]`
- Copy to clipboard, share via system share sheet
- The encoding should be opaque to non-users but decodable by the app

### Achievements
- Badge system for milestones (first session, streaks, weight thresholds)
- Display in profile

## Backend API

The app talks to the shitbit-web backend. Key endpoints the app consumes:

- `POST /auth/register` and `POST /auth/login`
- `POST /sessions` -- log a new session
- `GET /sessions` -- fetch user session history
- `GET /stats` -- aggregated stats
- `GET /friends` -- friend list
- `POST /friends/add` -- add friend
- `GET /leaderboard/:type` -- daily, weekly, alltime, biggest
- `GET /achievements` -- user achievements

## Development Guidelines

- All components should be functional components with hooks
- Use TypeScript strictly -- no `any` types
- BLE logic must be isolated in /services/ble so it can be mocked in tests
- All API calls go through the API service layer, never directly from components
- Handle offline gracefully -- queue sessions locally, sync when connection restores
- Test BLE flows with mock data during development (no hardware required)

## Environment

- Node 18+
- React Native 0.73+
- iOS 15+ / Android 12+
- Xcode 15+ for iOS builds
- Android Studio for Android builds
