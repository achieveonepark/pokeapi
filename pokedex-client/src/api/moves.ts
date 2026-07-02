import type { PokemonMove } from "./types";

/** Picks the version group with the most learnable-move entries, as a stand-in for "the most complete moveset". */
export function pickLatestVersionGroup(moves: PokemonMove[]): string | null {
  const counts = new Map<string, number>();
  for (const move of moves) {
    for (const detail of move.version_group_details) {
      const key = detail.version_group.name;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

export interface MoveEntry {
  name: string;
  method: string;
  level: number;
}

export function movesForVersionGroup(
  moves: PokemonMove[],
  versionGroup: string,
): MoveEntry[] {
  const entries: MoveEntry[] = [];
  for (const move of moves) {
    const detail = move.version_group_details.find(
      (d) => d.version_group.name === versionGroup,
    );
    if (!detail) continue;
    entries.push({
      name: move.move.name,
      method: detail.move_learn_method.name,
      level: detail.level_learned_at,
    });
  }
  return entries;
}

export function groupMovesByMethod(entries: MoveEntry[]): Map<string, MoveEntry[]> {
  const groups = new Map<string, MoveEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.method) ?? [];
    list.push(entry);
    groups.set(entry.method, list);
  }
  for (const [method, list] of groups) {
    if (method === "level-up") {
      list.sort((a, b) => a.level - b.level);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  return groups;
}
