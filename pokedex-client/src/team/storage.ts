import type { OwnedPokemon } from "./types";

const TEAM_KEY = "pokedex-team";
const ACTIVE_KEY = "pokedex-team-active";

export function loadTeam(): OwnedPokemon[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTeam(team: OwnedPokemon[]): void {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

export function loadActiveIndex(): number {
  const raw = localStorage.getItem(ACTIVE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function saveActiveIndex(index: number): void {
  localStorage.setItem(ACTIVE_KEY, String(index));
}
