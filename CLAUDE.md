# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cryptogram puzzle game (React 18 + TypeScript + Vite 4 + TailwindCSS). The same codebase is shipped to multiple distribution platforms — Yandex Games, GamePush, GameDistribution, YouTube Playables, and an Android wrapper — by passing a `PLATFORM` env var to Vite. Code branches on the global `__PLATFORM__` define for SDK calls (ads, IAP, leaderboards, save/load).

## Commands

Development (uses Vite dev server, no tests in the repo):
- `npm run dev` — start dev server with `PLATFORM=yandex` (default).
- `npm run dev:yt` — dev with YouTube Playables platform.
- `npm run dev:screen` — `PLATFORM=mobile MODE=screen` (used for screenshot mode).
- `npm run lint` — ESLint over `**/*.{ts,tsx}`, max-warnings 0.

Builds (`tsc` typecheck → wipe `dist/` → `vite build` → zip into `archiveBuildCryptogram/dist.zip`):
- `npm run build:yandex` / `build:gp` / `build:yt` / `build:gd` / `build:mobile` / `build:screen`

There is no test runner configured.

## Build / platform plumbing

- `vite.config.ts` reads `process.env.PLATFORM` and `process.env.MODE`, then:
  - injects them as EJS variables into `index.html` via `vite-plugin-html` (different `<script>` tags per platform — Yandex SDK, GameDistribution SDK, YouTube SDK, GamePush SDK, Yandex Metrika).
  - exposes them as global defines `__PLATFORM__` and `__MODE__` to TS code via `esbuild.define`.
- `react()` is configured with `fastRefresh: false` — HMR does full reloads.
- Valid `PLATFORM` values used in the code: `yandex`, `gp`, `yt`, `gd`, `mobile`, `default`. `MODE=screen` is for promotional screenshot capture and skips persistence side-effects.

When you see a check like `if (__PLATFORM__ === 'yandex')` it is gating actual SDK calls on `YSDK`, `playerGame`, `payments`, `gdsdk`, etc. Adding a new behavior usually means handling it for each platform in `src/main.tsx`.

## Architecture

`src/main.tsx` is the bootstrap, not just a render call. It:
1. Picks `mainLanguage` from `localStorage.prefferedLanguage` (note the typo — it's the real key) or detects from browser via `src/language.tsx`.
2. Dynamically imports level data: `src/levels/{lang}/allLevels.js`, `dailyLevels.js`, `locationLevels.js`, `allNames.js`. Languages currently shipped: `ru`, `en`, `de`, `es`, `fr`, `it`, plus `empty` as a stub.
3. Loads progress from one of: Yandex `playerGame.getData`, GamePush `YSDK.player`, YouTube `YSDK.game.loadData`, or `localStorage` (keys: `userStats` and `gameProgress` — for non-Russian: `gameProgress-{lang}`).
4. Initializes level arrays via `initLevels` / `initDailyLevels` / `initLocationLevels` / `initAllNames` in `src/levels.tsx` (these populate the module-level `levels`, `dailyLevels`, `locationLevels`, `namesDescs` exports that `Game.tsx` reads).
5. Renders `<App>` and provides every cross-cutting platform action (ads, purchases, leaderboards, server time, save) as exports from `main.tsx`.

`src/App.tsx` is the root React component. It owns the canonical `userData` state and persists it via `useEffect` → `saveData(userData)` (which round-trips to platform storage). Top-level UI tree:
- `Menu` (default) ↔ `Game` swapped via `react-transition-group` `SwitchTransition`.
- Modal overlays: `Shop`, `ShopMoney`, `Calendar` (event/seasonal levels).
- `gameLocation` toggles between `'main'`, `'dailyLevel'`, and `'calendar'` and selects which level pool to draw from.

`src/components/Game.tsx` + `Phrase.tsx` + `Keyboard.tsx` are the puzzle. Each level is a `LevelData` (`text`, `hiddenIndexes`, `name`, `desc`, `type`). The game replaces letters with numbers (same letter → same number across the phrase) and the user fills in the hidden indexes via the on-screen keyboard.

User progress shape (`UserDataProps` in `App.tsx`) — keep in sync if you add fields, and update `defaultUserStats` / `defaultUserData` / `fixUserData` / `fixUserStats` in `main.tsx` for the migration path on existing players.

State persistence is split for legacy reasons: `userStats` (tips, money, statistics, settings, taskObject, broccoliKilled, startedDate) and `gameProgress[-lang]` (lastLevel, lastLevelData, locations) are stored as separate localStorage keys / separate SDK fields, then merged at boot.

## Localization

- UI strings: `src/locales/translation.json` + `src/locales/locations.json`, merged in `src/i18n.tsx` into i18next resources (`ru`, `en`, `fr`, `es`, `it`, `de`).
- Per-language alphabet regex and on-screen keyboard layouts live in `src/levels.tsx` (`regexForDifferentLanguages`, `keyboardRows`).
- Level content is generated, not hand-edited in `src/levels/`. Generation tooling lives in `creatingLevels/` (`createLevel.cjs`, per-language `output.js`/`dailyLevelsTexts.js`). When adding a new language, follow `creatingLevels/ПРОЧИТАЙ_МЕНЯ_ПЕРЕД_ДОБАВЛЕНИЕМ_ЯЗЫКА.txt` — regex must be added to both `createLevel.cjs` and `levels.tsx`, plus keyboard layout, locales, allNames (generated via GPT), Rules component, and i18n entries.

## Conventions

`.cursorrules` documents the style: Tailwind for styling (avoid raw CSS where possible — the repo still has plenty of legacy `.css` files alongside Tailwind), `handle*` for event handlers, `const x = () => {}` over `function`, early returns. Comments and identifiers in the repo are mixed Russian/English — match what's around the change.
