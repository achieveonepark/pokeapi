import type { TFunction } from "i18next";
import { getMoveDetail } from "../api/client";
import { pickLatestVersionGroup } from "../api/moves";
import { localizedName } from "../api/textUtils";
import type { Pokemon, PokemonSpecies } from "../api/types";
import { typeEffectiveness } from "./typeChart";
import type { BattleFighter, TurnResult } from "./types";

const LEVEL = 50;

function hpAtLevel50(base: number): number {
  return Math.floor(((2 * base + 31) * LEVEL) / 100) + LEVEL + 10;
}

function statAtLevel50(base: number): number {
  return Math.floor(((2 * base + 31) * LEVEL) / 100) + 5;
}

export function buildFighter(
  key: "a" | "b",
  pokemon: Pokemon,
  species: PokemonSpecies | undefined,
  lang: string,
): BattleFighter {
  const statValue = (name: string) => pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 50;
  const versionGroup = pickLatestVersionGroup(pokemon.moves);
  const levelUpMoves = versionGroup
    ? pokemon.moves
        .filter((m) =>
          m.version_group_details.some(
            (d) => d.version_group.name === versionGroup && d.move_learn_method.name === "level-up",
          ),
        )
        .map((m) => m.move.name)
    : [];
  const movePool = levelUpMoves.length > 0 ? levelUpMoves : pokemon.moves.slice(0, 20).map((m) => m.move.name);

  const displayName = species
    ? localizedName(species.names, lang, pokemon.name)
    : pokemon.name.replace(/-/g, " ");

  const maxHp = hpAtLevel50(statValue("hp"));

  return {
    key,
    slug: pokemon.name,
    displayName,
    sprite:
      pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default ?? "",
    types: pokemon.types.map((t) => t.type.name),
    maxHp,
    hp: maxHp,
    attack: statAtLevel50(statValue("attack")),
    defense: statAtLevel50(statValue("defense")),
    specialAttack: statAtLevel50(statValue("special-attack")),
    specialDefense: statAtLevel50(statValue("special-defense")),
    speed: statAtLevel50(statValue("speed")),
    movePool: movePool.length > 0 ? movePool : ["tackle"],
  };
}

export async function resolveTurn(
  attacker: BattleFighter,
  defender: BattleFighter,
  lang: string,
  t: TFunction,
): Promise<TurnResult> {
  const moveSlug = attacker.movePool[Math.floor(Math.random() * attacker.movePool.length)];
  let moveData;
  try {
    moveData = await getMoveDetail(moveSlug);
  } catch {
    moveData = null;
  }

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
    };
  }

  const isPhysical = damageClass === "physical";
  const atk = isPhysical ? attacker.attack : attacker.specialAttack;
  const def = isPhysical ? defender.defense : defender.specialDefense;

  const base = ((2 * LEVEL) / 5 + 2) * power * (atk / def) / 50 + 2;
  const effectiveness = typeEffectiveness(moveType, defender.types);
  const isCrit = Math.random() < 1 / 16;
  const random = 0.85 + Math.random() * 0.15;
  const damage =
    effectiveness === 0 ? 0 : Math.max(1, Math.round(base * effectiveness * (isCrit ? 1.5 : 1) * random));

  const fainted = damage >= defender.hp;

  const messageKey =
    effectiveness === 0
      ? "battle.log.noEffect"
      : effectiveness > 1
        ? "battle.log.superEffective"
        : effectiveness < 1
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
  };
}
