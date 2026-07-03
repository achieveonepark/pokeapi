import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEvolutionChain, getPokemonByName, getPokemonSpecies } from "../api/client";
import { localizedName } from "../api/textUtils";
import { buildFighter, resolveTurn } from "../battle/simulate";
import type { BattleFighter, HitEffectiveness, TurnResult } from "../battle/types";
import { applyExp, expGainForVictory, rollWildLevel } from "../team/growth";
import { findLevelEvolution } from "../team/evolution";
import type { OwnedPokemon } from "../team/types";
import type { useTeam } from "../team/useTeam";
import { useSpeciesIndex } from "./usePokemon";

export type BattleStatus = "idle" | "loading" | "fighting" | "result";
export type BattleOutcome = "win" | "lose" | null;

export interface HitEvent {
  id: number;
  attackerKey: "a" | "b";
  defenderKey: "a" | "b";
  damage: number;
  effectiveness: HitEffectiveness;
  isCrit: boolean;
}

const TURN_DELAY_MS = 1100;

async function fetchFighter(
  queryClient: QueryClient,
  key: "a" | "b",
  name: string,
  level: number,
  lang: string,
) {
  const [pokemon, species] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["pokemon", name],
      queryFn: () => getPokemonByName(name),
      staleTime: Infinity,
    }),
    queryClient.fetchQuery({
      queryKey: ["species", name],
      queryFn: () => getPokemonSpecies(name),
      staleTime: Infinity,
    }),
  ]);
  return buildFighter(key, pokemon, species, lang, level);
}

/** Walks the evolution chain forward as far as `level` allows (handles double-jumps). */
async function resolveEvolutions(queryClient: QueryClient, slug: string, level: number): Promise<string> {
  let current = slug;
  for (let i = 0; i < 3; i++) {
    const species = await queryClient.fetchQuery({
      queryKey: ["species", current],
      queryFn: () => getPokemonSpecies(current),
      staleTime: Infinity,
    });
    const chain = await queryClient.fetchQuery({
      queryKey: ["evolution-chain", species.evolution_chain.url],
      queryFn: () => getEvolutionChain(species.evolution_chain.url),
      staleTime: Infinity,
    });
    const next = findLevelEvolution(chain, current, level);
    if (!next) break;
    current = next;
  }
  return current;
}

export function useBattle(teamApi: ReturnType<typeof useTeam>) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const queryClient = useQueryClient();
  const { data: index } = useSpeciesIndex();

  const [status, setStatus] = useState<BattleStatus>("idle");
  const [fighterA, setFighterA] = useState<BattleFighter | null>(null);
  const [fighterB, setFighterB] = useState<BattleFighter | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<BattleOutcome>(null);
  const [capturePending, setCapturePending] = useState(false);
  const [wildCatch, setWildCatch] = useState<OwnedPokemon | null>(null);
  const [lastHit, setLastHit] = useState<HitEvent | null>(null);
  const battleId = useRef(0);
  const activeIndexRef = useRef<number>(0);
  const hitIdRef = useRef(0);

  const start = useCallback(async () => {
    const activeMon = teamApi.active;
    if (!activeMon || !index || index.results.length < 1) return;
    activeIndexRef.current = teamApi.activeIndex;

    const thisBattle = ++battleId.current;
    setStatus("loading");
    setLog([]);
    setOutcome(null);
    setCapturePending(false);
    setWildCatch(null);
    setLastHit(null);

    const pool = index.results;
    const wildPick = pool[Math.floor(Math.random() * pool.length)];
    const wildLevel = rollWildLevel(activeMon.level);

    let a: BattleFighter;
    let b: BattleFighter;
    try {
      [a, b] = await Promise.all([
        fetchFighter(queryClient, "a", activeMon.slug, activeMon.level, lang),
        fetchFighter(queryClient, "b", wildPick.name, wildLevel, lang),
      ]);
    } catch {
      if (battleId.current !== thisBattle) return;
      setLog([t("battle.loadError")]);
      setStatus("idle");
      return;
    }
    if (battleId.current !== thisBattle) return;

    setFighterA(a);
    setFighterB(b);
    setLog([t("battle.log.start", { a: a.displayName, b: b.displayName })]);
    setStatus("fighting");

    let current: [BattleFighter, BattleFighter] = a.speed >= b.speed ? [a, b] : [b, a];
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (battleId.current === thisBattle) {
      const [attacker, defender] = current;
      await wait(TURN_DELAY_MS);
      if (battleId.current !== thisBattle) return;

      let result: TurnResult;
      try {
        result = await resolveTurn(attacker, defender, lang, t);
      } catch {
        result = {
          message: t("battle.log.noDamage", { attacker: attacker.displayName, move: "?" }),
          attacker: attacker.key,
          damage: 0,
          fainted: false,
          effectiveness: "normal",
          isCrit: false,
        };
      }
      if (battleId.current !== thisBattle) return;

      const newDefenderHp = Math.max(0, defender.hp - result.damage);
      const updatedDefender: BattleFighter = { ...defender, hp: newDefenderHp };

      if (defender.key === "a") setFighterA(updatedDefender);
      else setFighterB(updatedDefender);

      setLog((prev) => [...prev, result.message]);
      setLastHit({
        id: ++hitIdRef.current,
        attackerKey: attacker.key,
        defenderKey: defender.key,
        damage: result.damage,
        effectiveness: result.effectiveness,
        isCrit: result.isCrit,
      });

      if (newDefenderHp <= 0) {
        const playerWon = defender.key === "b";
        setLog((prev) => [...prev, t("battle.log.fainted", { name: defender.displayName })]);

        if (playerWon) {
          const gained = expGainForVictory(b.level);
          const { level: newLevel, exp: newExp, leveledUp } = applyExp(activeMon.level, activeMon.exp, gained);
          setLog((prev) => [...prev, t("battle.log.expGained", { name: a.displayName, exp: gained })]);

          let finalSlug = activeMon.slug;
          if (leveledUp) {
            setLog((prev) => [...prev, t("battle.log.levelUp", { name: a.displayName, level: newLevel })]);
            try {
              finalSlug = await resolveEvolutions(queryClient, activeMon.slug, newLevel);
              if (battleId.current !== thisBattle) return;
              if (finalSlug !== activeMon.slug) {
                const evolvedSpecies = await queryClient.fetchQuery({
                  queryKey: ["species", finalSlug],
                  queryFn: () => getPokemonSpecies(finalSlug),
                  staleTime: Infinity,
                });
                const evolvedName = localizedName(evolvedSpecies.names, lang, finalSlug.replace(/-/g, " "));
                setLog((prev) => [...prev, t("battle.log.evolved", { from: a.displayName, to: evolvedName })]);
              }
            } catch {
              // Evolution lookup failed (e.g. species data hiccup) — keep the level-up, just skip evolving.
              finalSlug = activeMon.slug;
            }
          }

          teamApi.updateMember(activeIndexRef.current, { level: newLevel, exp: newExp, slug: finalSlug });
          setOutcome("win");
          setWildCatch({ slug: b.slug, level: b.level, exp: 0 });
          setCapturePending(true);
          setLog((prev) => [...prev, t("battle.log.winner", { name: a.displayName })]);
        } else {
          setOutcome("lose");
          setLog((prev) => [...prev, t("battle.log.winner", { name: b.displayName })]);
        }

        setStatus("result");
        return;
      }

      current = [updatedDefender, attacker];
    }
  }, [index, lang, queryClient, t, teamApi]);

  const decideCapture = useCallback(
    (accept: boolean, replaceIndex?: number) => {
      if (accept && wildCatch) {
        if (teamApi.isFull) {
          if (replaceIndex !== undefined) {
            teamApi.replaceMember(replaceIndex, wildCatch);
          }
        } else {
          teamApi.addMember(wildCatch);
        }
      }
      setCapturePending(false);
      setWildCatch(null);
    },
    [teamApi, wildCatch],
  );

  return { status, fighterA, fighterB, log, outcome, capturePending, wildCatch, lastHit, start, decideCapture };
}
