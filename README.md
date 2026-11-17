# Tasks

A small task monitor for iOS and Android. Add tasks, mark them done, see what is due.
Everything is stored on the device with SQLite — no backend, no account.

## Requirements

- Node.js 20 or newer
- The Expo Go app on your phone, or an iOS/Android simulator

## Setup and run

```sh
npm install
npx expo start
```

Then:

- Scan the QR code with your camera (iOS) or the Expo Go app (Android), or
- Press `i` for the iOS simulator, `a` for an Android emulator

## Commands

```sh
npm test           # Jest tests for overdue and grouping logic
npm run typecheck  # TypeScript, strict mode
npm run lint       # ESLint
```

## Project structure

```
src/
  app/         screens: home, add/edit task, settings (Expo Router)
  components/  task row, segmented control, list row
  db/          SQLite schema and queries
  services/    grouping logic, reminders, theme, store
  types/       shared types
__tests__/     unit tests for the grouping logic
```

## Notes

- Reminders are local notifications scheduled for 9:00 on the due date. If
  notification permission is denied, the switch in Settings simply stays off.
- Theme follows the system setting by default and can be pinned to light or
  dark in Settings.
