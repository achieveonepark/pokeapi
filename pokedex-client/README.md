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
- **Battle** tab — a small trainer progression game, not just a one-off fight:
  - Pick any Pokemon as your starter (Lv.5) the first time you open the tab.
    Both the starter picker and wild encounters draw from the
    `/pokemon-species` list (base forms only), not the full `/pokemon` list
    — that list also includes megas/gmax/regional-form variants whose name
    doesn't match a `/pokemon-species/{name}` lookup, which used to make a
    battle hang forever on "Loading Pokemon…" if one got picked
  - Your active team member fights a random wild Pokemon leveled around its
    own level; a win awards EXP (own hand-tuned curve, not an official
    growth-rate curve), which can level your Pokemon up
  - Leveling into a species' real level-up evolution threshold (from
    PokeAPI's evolution chain data) auto-evolves it — only plain level-up
    evolutions are handled, not item/trade/friendship ones
  - After a win, choose whether to add the defeated wild Pokemon to your
    team; team caps at 6, and capturing while full asks you to release one
    of your current 6 to make room
  - Team + active-member choice persists to `localStorage` between sessions
  - Combat itself: real base stats scaled to each fighter's own level, a
    full 18-type effectiveness chart, and a random move from the attacker's
    level-up moveset each turn (real power/type/damage class fetched from
    PokeAPI) — no accuracy rolls, status moves, or held items. It's meant to
    capture the "watching your Pokemon fight and grow" feeling, not be a
    rules-accurate battle engine.
  - Each turn prefers a move with actual power over a status move (tries a
    few random candidates from the movepool before falling back), so a
    low-level Pokemon whose only learned move is something like Growl
    doesn't spend every turn doing nothing
  - Hit feedback: the attacker pulses, the defender shakes (bigger shake on
    crits/super-effective hits), a floating damage number pops up in
    red (gold for crits), and a colored flash + "Super Effective!" / "Not
    Very Effective..." label appear over the sprite for a beat.
  - Fighters render as animated Mystery Dungeon-style pixel sprites (Idle,
    a brief Attack pose on your turn, Hurt on taking damage, Faint at 0 HP)
    from [PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab)
    — CC BY-NC 4.0, credited in the pixel sprite detail panel and pulled
    live at runtime (nothing bundled). Coverage isn't 100%; a species with
    no SpriteCollab data falls back to its official artwork automatically.
- Detail page **Pixel Sprite** panel: the same SpriteCollab data — a static
  portrait plus buttons to preview whichever animations exist for that
  species (Idle/Walk/Attack/Hurt/Sleep/Faint), with credit and a link to the
  source repo. Hidden entirely for species without SpriteCollab coverage.

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

## Web deployment (GitHub Pages)

This is the same React/Vite app underneath, so it also runs as a plain
website — no Tauri/Rust build involved. `.github/workflows/pokedex-client-pages.yml`
builds `pokedex-client` (with `VITE_BASE_PATH=/pokeapi/` so asset URLs resolve
under that subpath — see `vite.config.ts`) and deploys it to GitHub Pages
automatically on every push to `master` that touches `pokedex-client/**`.

**One-time setup required** (I don't have permission to change repo
settings): in this repo's **Settings → Pages**, set **Build and
deployment → Source** to **GitHub Actions**. After that, the workflow above
handles every future deploy on its own.

Where it ends up depends on the GitHub Pages/custom-domain setup for this
GitHub account: if `achieveonepark`'s `achieveonepark.github.io` user site
already has `somiri.dev` configured as its custom domain, this project's
Pages site is automatically served at `somiri.dev/pokeapi/` (GitHub's
"project pages inherit the user site's custom domain" behavior); otherwise
it'll be at `achieveonepark.github.io/pokeapi/` until that's set up.

To build it locally for any other static host:

```sh
cd pokedex-client
VITE_BASE_PATH=/pokeapi/ npm run build   # or VITE_BASE_PATH=/ for root hosting
```

`dist/` is the complete static site — upload it anywhere. Routing is
hash-based (`/#/pokemon/pikachu`), so no server-side rewrite rules are
needed for client-side routes to work.

## Project structure

```
src/
  api/          PokeAPI client, types, and formatting helpers
  hooks/        React Query hooks wrapping the API client, plus useBattle (battle orchestration)
  team/         Team persistence (localStorage), growth/EXP curve, level-evolution lookup
  battle/       Battle simulation engine (fighter stats, turn resolution, type chart)
  pmd/          SpriteCollab client: URLs, AnimData.xml parsing, animation frame data
  components/   Reusable UI pieces (cards, badges, stat bars, evolution chain, moves, team/battle UI)
  pages/        ListPage, DetailPage, BattlePage
  i18n/         en/ko locale files and i18next setup
src-tauri/      Rust/Tauri shell (minimal — all logic lives in the webview)
```

## Notes

- Data is fetched client-side directly from `https://pokeapi.co/api/v2`, which
  sends permissive CORS headers, so no Rust-side HTTP proxying is needed.
- The Pokemon name/ID index is fetched once and cached indefinitely via
  React Query; search and type filtering happen client-side against that index.
- Per-card sprite/type data and detail-page data are fetched on demand and
  cached indefinitely, since PokeAPI's dataset for a given Pokemon rarely changes.
