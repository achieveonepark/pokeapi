export const MAX_TEAM_SIZE = 6;
export const MAX_LEVEL = 100;
export const STARTER_LEVEL = 5;

export function hpAtLevel(base: number, level: number): number {
  return Math.floor(((2 * base + 31) * level) / 100) + level + 10;
}

export function statAtLevel(base: number, level: number): number {
  return Math.floor(((2 * base + 31) * level) / 100) + 5;
}

/** EXP required to go from `level` to `level + 1`. Gentle, hand-tuned curve (not an official growth-rate curve). */
export function expToNextLevel(level: number): number {
  return 20 + level * 12;
}

/** EXP awarded for beating a wild Pokemon of the given level. */
export function expGainForVictory(defeatedLevel: number): number {
  return 15 + defeatedLevel * 4;
}

/** Wild encounter level: roughly around the player's active level, with some spread. */
export function rollWildLevel(playerLevel: number): number {
  const offset = Math.floor(Math.random() * 5) - 2; // -2..+2
  return Math.max(2, Math.min(MAX_LEVEL, playerLevel + offset));
}

/** Applies EXP and returns the resulting level (capped) plus whether it leveled up at all. */
export function applyExp(level: number, exp: number, gained: number): { level: number; exp: number; leveledUp: boolean } {
  let newLevel = level;
  let newExp = exp + gained;
  let leveledUp = false;
  while (newLevel < MAX_LEVEL && newExp >= expToNextLevel(newLevel)) {
    newExp -= expToNextLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }
  if (newLevel >= MAX_LEVEL) {
    newLevel = MAX_LEVEL;
    newExp = 0;
  }
  return { level: newLevel, exp: newExp, leveledUp };
}
