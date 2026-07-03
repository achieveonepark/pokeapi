import type { TFunction } from "i18next";
import { getMoveDetail } from "../api/client";
import { pickLatestVersionGroup } from "../api/moves";
import { localizedName } from "../api/textUtils";
import type { Pokemon, PokemonSpecies } from "../api/types";
import { hpAtLevel, statAtLevel } from "../team/growth";
import { typeEffectiveness } from "./typeChart";
import type { BattleFighter, TurnResult } from "./types";

export function buildFighter(
  key: "a" | "b",
  pokemon: Pokemon,
  species: PokemonSpecies | undefined,
  lang: string,
  level: number,
): BattleFighter {
  const statValue = (name: string) => pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 50;
  const versionGroup = pickLatestVersionGroup(pokemon.moves);
  const levelUpMoves = versionGroup
    ? pokemon.moves
        .filter((m) =>
          m.version_group_details.some(
            (d) =>
              d.version_group.name === versionGroup &&
              d.move_learn_method.name === "level-up" &&
              d.level_learned_at <= level,
          ),
        )
        .map((m) => m.move.name)
    : [];
  const movePool = levelUpMoves.length > 0 ? levelUpMoves : pokemon.moves.slice(0, 20).map((m) => m.move.name);

  const displayName = species
    ? localizedName(species.names, lang, pokemon.name)
    : pokemon.name.replace(/-/g, " ");

  const maxHp = hpAtLevel(statValue("hp"), level);

  return {
    key,
    slug: pokemon.name,
    displayName,
    sprite:
      pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default ?? "",
    types: pokemon.types.map((t) => t.type.name),
    level,
    maxHp,
    hp: maxHp,
    attack: statAtLevel(statValue("attack"), level),
    defense: statAtLevel(statValue("defense"), level),
    specialAttack: statAtLevel(statValue("special-attack"), level),
    specialDefense: statAtLevel(statValue("special-defense"), level),
    speed: statAtLevel(statValue("speed"), level),
    movePool: movePool.length > 0 ? movePool : ["tackle"],
  };
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks a random move, but tries a few distinct candidates in search of one
 * with real power first — otherwise a Pokemon with mostly status moves in
 * its early movepool (e.g. a starter that only knows Growl at Lv.5) reads as
 * "does nothing but cry" turn after turn, which isn't much of a battle.
 */
async function pickDamagingMove(movePool: string[]): Promise<{ slug: string; data: Awaited<ReturnType<typeof getMoveDetail>> | null }> {
  const candidates = shuffled(movePool).slice(0, Math.min(3, movePool.length));
  let fallback: { slug: string; data: Awaited<ReturnType<typeof getMoveDetail>> | null } | null = null;

  for (const slug of candidates) {
    let data: Awaited<ReturnType<typeof getMoveDetail>> | null;
    try {
      data = await getMoveDetail(slug);
    } catch {
      data = null;
    }
    if (data?.power) return { slug, data };
    if (!fallback) fallback = { slug, data };
  }
  return fallback ?? { slug: movePool[0], data: null };
}

export async function resolveTurn(
  attacker: BattleFighter,
  defender: BattleFighter,
  lang: string,
  t: TFunction,
): Promise<TurnResult> {
  const { slug: moveSlug, data: moveData } = await pickDamagingMove(attacker.movePool);

  const moveName = moveData
    ? localizedName(moveData.names, lang, moveSlug.replace(/-/g, " "))
    : moveSlug.replace(/-/g, " ");

  const power = moveData?.power ?? null;
  const damageClass = moveData?.damage_class?.name ?? "physical";
  const moveType = moveData?.type?.name ?? attacker.types[0];

  if (!power) {
    return {
      message: t("battle.log.noDamage", { attacker: attacker.displayName, move: moveName }),
      attacker: attacker.key,
      damage: 0,
      fainted: false,
      effectiveness: "normal",
      isCrit: false,
    };
  }

  const isPhysical = damageClass === "physical";
  const atk = isPhysical ? attacker.attack : attacker.specialAttack;
  const def = isPhysical ? defender.defense : defender.specialDefense;

  const base = ((2 * attacker.level) / 5 + 2) * power * (atk / def) / 50 + 2;
  const rawEffectiveness = typeEffectiveness(moveType, defender.types);
  const isCrit = Math.random() < 1 / 16;
  const random = 0.85 + Math.random() * 0.15;
  const damage =
    rawEffectiveness === 0
      ? 0
      : Math.max(1, Math.round(base * rawEffectiveness * (isCrit ? 1.5 : 1) * random));

  const fainted = damage >= defender.hp;

  const effectiveness: TurnResult["effectiveness"] =
    rawEffectiveness === 0 ? "none" : rawEffectiveness > 1 ? "super" : rawEffectiveness < 1 ? "not-very" : "normal";

  const messageKey =
    effectiveness === "none"
      ? "battle.log.noEffect"
      : effectiveness === "super"
        ? "battle.log.superEffective"
        : effectiveness === "not-very"
          ? "battle.log.notVeryEffective"
          : isCrit
            ? "battle.log.critical"
            : "battle.log.hit";

  return {
    message: t(messageKey, {
      attacker: attacker.displayName,
      move: moveName,
      defender: defender.displayName,
      damage,
    }),
    attacker: attacker.key,
    damage,
    fainted,
    effectiveness,
    isCrit,
  };
}
