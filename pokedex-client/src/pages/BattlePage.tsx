import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TypeBadge } from "../components/TypeBadge";
import { useBattle } from "../hooks/useBattle";
import type { BattleFighter } from "../battle/types";

function FighterPanel({ fighter, mirrored }: { fighter: BattleFighter | null; mirrored?: boolean }) {
  const { t } = useTranslation();
  if (!fighter) return <div className="fighter-panel fighter-placeholder" />;

  const pct = Math.max(0, Math.min(100, (fighter.hp / fighter.maxHp) * 100));
  const hpColor = pct > 50 ? "#4caf50" : pct > 20 ? "#ffb300" : "#e64a4a";
  const fainted = fighter.hp <= 0;

  return (
    <div className={`fighter-panel ${fainted ? "fainted" : ""}`}>
      <div className="fighter-info">
        <span className="fighter-name">{fighter.displayName}</span>
        <span className="fighter-level">{t("battle.level", { level: 50 })}</span>
      </div>
      <div className="fighter-types">
        {fighter.types.map((typeName) => (
          <TypeBadge key={typeName} name={typeName} />
        ))}
      </div>
      <div className="hp-row">
        <span className="hp-label">HP</span>
        <div className="hp-bar-track">
          <div className="hp-bar-fill" style={{ width: `${pct}%`, backgroundColor: hpColor }} />
        </div>
        <span className="hp-value">
          {fighter.hp}/{fighter.maxHp}
        </span>
      </div>
      <img
        src={fighter.sprite}
        alt={fighter.displayName}
        className={`fighter-sprite ${mirrored ? "mirrored" : ""}`}
      />
    </div>
  );
}

export function BattlePage() {
  const { t } = useTranslation();
  const { status, fighterA, fighterB, log, winner, start } = useBattle();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  return (
    <div className="battle-page">
      <div className="battle-arena">
        <FighterPanel fighter={fighterB} mirrored />
        <span className="battle-vs">VS</span>
        <FighterPanel fighter={fighterA} />
      </div>

      <div className="battle-log" ref={logRef}>
        {status === "idle" && <p className="empty-note">{t("battle.idle")}</p>}
        {log.map((line, i) => (
          <p key={i} className={i === log.length - 1 ? "battle-log-latest" : ""}>
            {line}
          </p>
        ))}
      </div>

      <div className="battle-controls">
        <button
          className="battle-start-button"
          disabled={status === "loading" || status === "fighting"}
          onClick={start}
        >
          {status === "loading"
            ? t("battle.loading")
            : status === "finished"
              ? t("battle.restart")
              : t("battle.start")}
        </button>
        {winner && (
          <span className="battle-winner-banner">{t("battle.log.winner", { name: winner.displayName })}</span>
        )}
      </div>
    </div>
  );
}
