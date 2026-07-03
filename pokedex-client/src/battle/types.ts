export interface BattleFighter {
  key: "a" | "b";
  slug: string;
  dexId: number;
  displayName: string;
  sprite: string;
  types: string[];
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  movePool: string[];
}

export type HitEffectiveness = "normal" | "super" | "not-very" | "none";

export interface TurnResult {
  message: string;
  attacker: "a" | "b";
  damage: number;
  fainted: boolean;
  effectiveness: HitEffectiveness;
  isCrit: boolean;
}
