import { useMemo, useState } from "react";
import {
  groupMovesByMethod,
  movesForVersionGroup,
  pickLatestVersionGroup,
} from "../api/moves";
import type { PokemonMove } from "../api/types";

const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level Up",
  machine: "TM / HM",
  egg: "Egg Moves",
  tutor: "Move Tutor",
};

export function MovesList({ moves }: { moves: PokemonMove[] }) {
  const versionGroup = useMemo(() => pickLatestVersionGroup(moves), [moves]);
  const grouped = useMemo(() => {
    if (!versionGroup) return new Map();
    return groupMovesByMethod(movesForVersionGroup(moves, versionGroup));
  }, [moves, versionGroup]);

  const methods = Array.from(grouped.keys());
  const [activeMethod, setActiveMethod] = useState(methods[0] ?? null);
  const active = activeMethod ?? methods[0] ?? null;

  if (!versionGroup || methods.length === 0) {
    return <p className="empty-note">No move data available.</p>;
  }

  return (
    <div className="moves-list">
      <div className="moves-tabs">
        {methods.map((method) => (
          <button
            key={method}
            className={`moves-tab ${method === active ? "active" : ""}`}
            onClick={() => setActiveMethod(method)}
          >
            {METHOD_LABELS[method] ?? method} ({grouped.get(method)?.length})
          </button>
        ))}
      </div>
      <ul className="moves-grid">
        {active &&
          grouped.get(active)?.map((entry: { name: string; level: number }) => (
            <li key={entry.name} className="move-entry">
              {active === "level-up" && (
                <span className="move-level">Lv {entry.level}</span>
              )}
              <span className="move-name">{entry.name.replace(/-/g, " ")}</span>
            </li>
          ))}
      </ul>
      <p className="version-group-note">Moveset shown for: {versionGroup.replace(/-/g, " ")}</p>
    </div>
  );
}
