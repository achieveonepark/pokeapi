import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPokemonByName, getPokemonSpecies } from "../api/client";
import { buildFighter, resolveTurn } from "../battle/simulate";
import type { BattleFighter, TurnResult } from "../battle/types";
import { usePokemonIndex } from "./usePokemon";

export type BattleStatus = "idle" | "loading" | "fighting" | "finished";

const TURN_DELAY_MS = 1100;

export function useBattle() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const queryClient = useQueryClient();
  const { data: index } = usePokemonIndex();

  const [status, setStatus] = useState<BattleStatus>("idle");
  const [fighterA, setFighterA] = useState<BattleFighter | null>(null);
  const [fighterB, setFighterB] = useState<BattleFighter | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<BattleFighter | null>(null);
  const battleId = useRef(0);

  const start = useCallback(async () => {
    if (!index || index.results.length < 2) return;
    const thisBattle = ++battleId.current;
    setStatus("loading");
    setLog([]);
    setWinner(null);

    const pool = index.results;
    const pickA = pool[Math.floor(Math.random() * pool.length)];
    let pickB = pool[Math.floor(Math.random() * pool.length)];
    while (pickB.name === pickA.name) {
      pickB = pool[Math.floor(Math.random() * pool.length)];
    }

    const fetchFighter = async (key: "a" | "b", name: string) => {
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
      return buildFighter(key, pokemon, species, lang);
    };

    const [a, b] = await Promise.all([fetchFighter("a", pickA.name), fetchFighter("b", pickB.name)]);
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
          message: t("battle.log.noDamage", {
            attacker: attacker.displayName,
            move: "?",
          }),
          attacker: attacker.key,
          damage: 0,
          fainted: false,
        };
      }
      if (battleId.current !== thisBattle) return;

      const newDefenderHp = Math.max(0, defender.hp - result.damage);
      const updatedDefender: BattleFighter = { ...defender, hp: newDefenderHp };

      if (defender.key === "a") setFighterA(updatedDefender);
      else setFighterB(updatedDefender);

      setLog((prev) => [...prev, result.message]);

      if (newDefenderHp <= 0) {
        setLog((prev) => [
          ...prev,
          t("battle.log.fainted", { name: defender.displayName }),
          t("battle.log.winner", { name: attacker.displayName }),
        ]);
        setWinner(attacker);
        setStatus("finished");
        return;
      }

      // Alternate turns: whoever just got hit swings back next.
      current = [updatedDefender, attacker];
    }
  }, [index, lang, queryClient, t]);

  return { status, fighterA, fighterB, log, winner, start };
}
