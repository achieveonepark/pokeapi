import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  groupMovesByMethod,
  movesForVersionGroup,
  pickLatestVersionGroup,
} from "../api/moves";
import type { PokemonMove } from "../api/types";

export function MovesList({ moves }: { moves: PokemonMove[] }) {
  const { t } = useTranslation();
  const versionGroup = useMemo(() => pickLatestVersionGroup(moves), [moves]);
  const grouped = useMemo(() => {
    if (!versionGroup) return new Map();
    return groupMovesByMethod(movesForVersionGroup(moves, versionGroup));
  }, [moves, versionGroup]);

  const methods = Array.from(grouped.keys());
  const [activeMethod, setActiveMethod] = useState(methods[0] ?? null);
  const active = activeMethod ?? methods[0] ?? null;

  if (!versionGroup || methods.length === 0) {
    return <p className="empty-note">{t("moves.empty")}</p>;
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
            {t(`moves.${method}`, { defaultValue: method })} ({grouped.get(method)?.length})
          </button>
        ))}
      </div>
      <ul className="moves-grid">
        {active &&
          grouped.get(active)?.map((entry: { name: string; level: number }) => (
            <li key={entry.name} className="move-entry">
              {active === "level-up" && (
                <span className="move-level">{t("moves.level", { level: entry.level })}</span>
              )}
              <span className="move-name">{entry.name.replace(/-/g, " ")}</span>
            </li>
          ))}
      </ul>
      <p className="version-group-note">
        {t("moves.versionNote", { version: versionGroup.replace(/-/g, " ") })}
      </p>
    </div>
  );
}
