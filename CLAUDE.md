# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses a Next.js version with breaking API changes that may differ from training data. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for current conventions.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # type check

npm run test         # vitest (watch mode)
npm run test:run     # vitest (single run)
npm run test:run -- src/__tests__/lib/utils/statistics.test.ts  # single file
npm run test:coverage
```

Before delivering any change, verify all three pass:

```bash
npx tsc --noEmit && npm run test:run && npm run build
```

## Architecture

### Request flow

```
Page component
  → custom hook (src/hooks/)
    → Firestore functions (src/lib/firestore/)
      → Firebase SDK
```

Components never call Firestore directly. All Firestore access is isolated in `src/lib/firestore/{gears,trips,tripGears}.ts`. Domain logic (statistics, consumption calculations) lives in `src/lib/utils/` as pure functions and is the primary test target.

### Route groups

- `src/app/(auth)/` — unauthenticated pages (login)
- `src/app/(app)/` — auth-protected pages (gears, trips, statistics)

The auth guard is in `src/app/(app)/layout.tsx`: it reads from `AuthContext` and redirects to `/login` if no user. `AuthProvider` wraps the entire app in the root layout; `SettingsProvider` is only inside `(app)/layout.tsx`.

### Hook data pattern

All data hooks (`useGears`, `useTrips`, `useTripGears`, `useStatistics`) follow a fetch-on-mutate approach: after every mutation they call a shared `load()` function to refresh local state from Firestore. `useTripGears` is the most complex — it loads four collections in parallel and exposes `unplannedGears` (gears not yet added to the trip) as a derived value.

### Consumable stock flow

`usageCount` (持参回数) is never stored in Firestore — it is computed by counting `TripGear` documents. When `completeTrip()` is called, `calcConsumedUnits()` (from `src/lib/utils/statistics.ts`) calculates how many units were actually used per consumable gear and decrements `Gear.stock` in Firestore. Trip `status` is then set to `'completed'`.

### Statistics functions (`src/lib/utils/statistics.ts`)

Pure functions that take `Gear[]` and `TripGear[]` as arguments:
- `calcGearUsageRanking` — sorts by trip count
- `filterUnusedGears` — gears with zero TripGear records
- `calcConsumptionSuggestion` — returns a Japanese suggestion string based on average consumption ratio across past trips; returns `null` if no data

## Key conventions

### TypeScript

`any` is banned; strict mode is always on. `@` is a path alias for `src/`.

### Authentication

- Only `signInWithPopup` (Google OAuth). `signInWithRedirect` is banned due to iOS Safari ITP erasing sessionStorage.
- `initializeAuth` **must** receive `browserPopupRedirectResolver`; omitting it causes `auth/argument-error` on `signInWithPopup`. `getAuth` includes it by default but `initializeAuth` does not.
- Firestore is initialized with `ignoreUndefinedProperties: true` to handle optional fields cleanly.

### Settings

UI preferences are managed in `SettingsContext` (persisted to `localStorage` under key `campgear_settings`). Currently: `showGearImages` (default `false`). Access via `useSettings()`.

### Testing

Tests live under `src/__tests__/`. The global setup in `src/__tests__/setup.ts` mocks `next/navigation` and `@/lib/firebase` for all tests. Use `{ toDate: () => new Date() } as Timestamp` for fake Firestore timestamps in test fixtures.

Only domain/utility functions require unit tests. Component tests may be added but are not required.

## Data model

```
gears/{gearId}       userId, name, category, isRequired, isConsumable, stock?, memo, imageUrl, createdAt
trips/{tripId}       userId, name, date (YYYY-MM-DD), location?, memo, status ('planned'|'completed'), createdAt
tripGears/{id}       userId, tripId, gearId, checked, quantity, quantityUsed, consumptionLevel?
```

`GearCategory`: `tent | furniture | kitchen | lighting | tools | apparel | other`

`ConsumptionLevel`: `little | half | most | all` — used for partial consumption of a consumable in a single trip.

Display labels for categories are in `src/lib/constants/categories.ts`.

## Environment

Copy `.env.example` to `.env.local` and fill in Firebase project values (`NEXT_PUBLIC_FIREBASE_*`). No other environment variables are needed for local development.
