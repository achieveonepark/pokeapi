# Pokedex Client (Tauri + React + TypeScript)

A native desktop Pokedex built with [Tauri](https://tauri.app), React, and
TypeScript. It talks directly to the public [PokeAPI](https://pokeapi.co/api/v2)
REST API — no backend server required.

## Features

- Browse and search all Pokemon by name or ID, filterable by type
- Detail view with:
  - Official artwork (with shiny toggle)
  - Types, abilities (incl. hidden), base stats
  - Height/weight, base experience, shape, color, habitat
  - Flavor text, genus, legendary/mythical/baby tags
  - Breeding info: capture rate, base happiness, growth rate, egg groups, hatch steps, gender ratio
  - Full evolution chain with evolution conditions (level, item, trade, etc.)
  - Alternate forms/varieties
  - Move list grouped by learn method (level-up, TM/HM, egg, tutor)
  - Cry audio playback (where available)
- English / Korean UI (language picker in the title bar, persisted locally).
  Pokemon names, genus, flavor text, abilities, and moves use PokeAPI's own
  per-language data (fetched per ability/move, cached indefinitely, English
  fallback while loading); types, stats, growth rate, egg groups, habitat,
  color, and shape are translated client-side. Held item names inside
  evolution conditions stay in English (low-traffic edge case).
- Custom Poké Ball app icon (`src-tauri/icons/`, sourced from `public/pokeball.svg`)
- **Battle** tab: picks two random Pokemon and plays out a lightweight
  auto-battle — real base stats (scaled to level 50) and a full 18-type
  effectiveness chart, but a random move from each Pokemon's own level-up
  moveset each turn (fetched from PokeAPI for real power/type/damage class)
  rather than a real 4-move loadout or accuracy/status effects. It's meant to
  capture the "watching two Pokemon fight" feeling, not be a rules-accurate
  battle engine.

## Prerequisites (macOS)

1. Xcode Command Line Tools: `xcode-select --install`
2. [Rust](https://www.rust-lang.org/tools/install): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.sh | sh`
3. Node.js 18+ (e.g. via `brew install node` or nvm)

## Setup

```sh
cd pokedex-client
npm install
```

## Run in development

```sh
npm run tauri dev
```

This opens a native window with hot reload. Requires internet access
(the app fetches live data from `pokeapi.co`).

## Build a macOS app bundle

```sh
npm run tauri build
```

The unsigned `.app` / `.dmg` will be under `src-tauri/target/release/bundle/`.

## Downloading a prebuilt release

Prebuilt macOS (`.dmg`, `.app`) and Windows (`.msi`, `.exe`) builds are
published to the repo's [Releases](../../releases) page by the
**Pokedex Client Release** GitHub Actions workflow. It's manually triggered
(Actions tab → "Pokedex Client Release" → "Run workflow") rather than firing
on every push, so it doesn't collide with this repo's other tag-triggered
release/publish workflows.

Builds are unsigned: macOS will show an "unidentified developer" warning
(right-click the app → Open to bypass), and Windows SmartScreen may warn on
first run. Code signing isn't configured — it requires paid Apple/Windows
developer certificates.

## Project structure

```
src/
  api/          PokeAPI client, types, and formatting helpers
  hooks/        React Query hooks wrapping the API client
  components/   Reusable UI pieces (cards, badges, stat bars, evolution chain, moves)
  pages/        ListPage (browse/search) and DetailPage (full Pokemon info)
src-tauri/      Rust/Tauri shell (minimal — all logic lives in the webview)
```

## Notes

- Data is fetched client-side directly from `https://pokeapi.co/api/v2`, which
  sends permissive CORS headers, so no Rust-side HTTP proxying is needed.
- The Pokemon name/ID index is fetched once and cached indefinitely via
  React Query; search and type filtering happen client-side against that index.
- Per-card sprite/type data and detail-page data are fetched on demand and
  cached indefinitely, since PokeAPI's dataset for a given Pokemon rarely changes.
