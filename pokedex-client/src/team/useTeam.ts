import { useCallback, useEffect, useState } from "react";
import { loadActiveIndex, loadTeam, saveActiveIndex, saveTeam } from "./storage";
import { MAX_TEAM_SIZE } from "./growth";
import type { OwnedPokemon } from "./types";

export function useTeam() {
  const [team, setTeam] = useState<OwnedPokemon[]>(() => loadTeam());
  const [activeIndex, setActiveIndexState] = useState<number>(() => loadActiveIndex());

  useEffect(() => saveTeam(team), [team]);
  useEffect(() => saveActiveIndex(activeIndex), [activeIndex]);

  const setActiveIndex = useCallback((index: number) => {
    setActiveIndexState(index);
  }, []);

  const updateMember = useCallback((index: number, patch: Partial<OwnedPokemon>) => {
    setTeam((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }, []);

  const addMember = useCallback((mon: OwnedPokemon): boolean => {
    let added = false;
    setTeam((prev) => {
      if (prev.length >= MAX_TEAM_SIZE) return prev;
      added = true;
      return [...prev, mon];
    });
    return added;
  }, []);

  const replaceMember = useCallback((index: number, mon: OwnedPokemon) => {
    setTeam((prev) => prev.map((m, i) => (i === index ? mon : m)));
  }, []);

  const resetTeam = useCallback(() => {
    setTeam([]);
    setActiveIndexState(0);
  }, []);

  const active = team[activeIndex] ?? null;

  return {
    team,
    activeIndex: Math.min(activeIndex, Math.max(0, team.length - 1)),
    active,
    setActiveIndex,
    updateMember,
    addMember,
    replaceMember,
    resetTeam,
    isFull: team.length >= MAX_TEAM_SIZE,
  };
}
