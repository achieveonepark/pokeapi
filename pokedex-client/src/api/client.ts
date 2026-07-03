import type {
  EvolutionChain,
  LocalizedNamesResource,
  MoveDetail,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeDetail,
} from "./types";

const BASE_URL = "https://pokeapi.co/api/v2";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PokeAPI request failed (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Fetches the full name/url index of every Pokemon (including forms/megas/gmax) in one shot. */
export function getAllPokemonIndex() {
  return getJSON<PokemonListResponse>(
    `${BASE_URL}/pokemon?limit=100000&offset=0`,
  );
}

/**
 * Fetches the full name/url index of every Pokemon *species* (base forms only,
 * one entry per species — no megas/gmax/regional-form variants). Unlike
 * `/pokemon` entries, every name here is guaranteed to have a matching
 * `/pokemon-species/{name}` AND `/pokemon/{name}` (its default form), so it's
 * safe to use for anything that needs both (e.g. battle encounters).
 */
export function getAllSpeciesIndex() {
  return getJSON<PokemonListResponse>(
    `${BASE_URL}/pokemon-species?limit=100000&offset=0`,
  );
}

export function getPokemonByName(nameOrId: string | number) {
  return getJSON<Pokemon>(`${BASE_URL}/pokemon/${nameOrId}`);
}

export function getPokemonSpecies(nameOrId: string | number) {
  return getJSON<PokemonSpecies>(`${BASE_URL}/pokemon-species/${nameOrId}`);
}

export function getEvolutionChain(url: string) {
  return getJSON<EvolutionChain>(url);
}

export function getAllTypes() {
  return getJSON<PokemonListResponse>(`${BASE_URL}/type`);
}

export function getTypeDetail(name: string) {
  return getJSON<PokemonTypeDetail>(`${BASE_URL}/type/${name}`);
}

export function getAbilityDetail(name: string) {
  return getJSON<LocalizedNamesResource>(`${BASE_URL}/ability/${name}`);
}

export function getMoveDetail(name: string) {
  return getJSON<MoveDetail>(`${BASE_URL}/move/${name}`);
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
