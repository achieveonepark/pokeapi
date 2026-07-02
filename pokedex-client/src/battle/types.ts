export interface BattleFighter {
  key: "a" | "b";
  slug: string;
  displayName: string;
  sprite: string;
  types: string[];
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  movePool: string[];
}

export interface TurnResult {
  message: string;
  attacker: "a" | "b";
  damage: number;
  fainted: boolean;
}
