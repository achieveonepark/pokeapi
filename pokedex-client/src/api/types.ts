// Minimal typings for the subset of the PokeAPI (https://pokeapi.co/api/v2)
// response shapes this app consumes.

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    home?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonCries {
  latest: string | null;
  legacy: string | null;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersionDetail[];
}

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  base_experience: number | null;
  order: number;
  is_default: boolean;
  species: NamedAPIResource;
  sprites: PokemonSprites;
  cries?: PokemonCries;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
}

export interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  color: NamedAPIResource;
  shape: NamedAPIResource | null;
  habitat: NamedAPIResource | null;
  growth_rate: NamedAPIResource;
  egg_groups: NamedAPIResource[];
  generation: NamedAPIResource;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: { url: string };
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
  names: { name: string; language: NamedAPIResource }[];
  varieties: { is_default: boolean; pokemon: NamedAPIResource }[];
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: NamedAPIResource | null;
  item: NamedAPIResource | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  time_of_day: string;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  held_item: NamedAPIResource | null;
  trade_species: NamedAPIResource | null;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface PokemonTypeDetail {
  id: number;
  name: string;
  pokemon: { slot: number; pokemon: NamedAPIResource }[];
}

export interface LocalizedNamesResource {
  name: string;
  names: { name: string; language: NamedAPIResource }[];
}

export interface MoveDetail extends LocalizedNamesResource {
  power: number | null;
  accuracy: number | null;
  type: NamedAPIResource;
  damage_class: NamedAPIResource;
}
