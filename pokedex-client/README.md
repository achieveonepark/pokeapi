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

The signed `.app` / `.dmg` will be under `src-tauri/target/release/bundle/`.

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
