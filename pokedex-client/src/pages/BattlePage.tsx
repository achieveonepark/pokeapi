import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CapturePrompt } from "../components/CapturePrompt";
import { StarterPicker } from "../components/StarterPicker";
import { TeamRoster } from "../components/TeamRoster";
import { TypeBadge } from "../components/TypeBadge";
import { useBattle } from "../hooks/useBattle";
import type { HitEvent } from "../hooks/useBattle";
import { STARTER_LEVEL } from "../team/growth";
import { useTeam } from "../team/useTeam";
import type { BattleFighter } from "../battle/types";

function FighterPanel({
  fighter,
  mirrored,
  hit,
}: {
  fighter: BattleFighter | null;
  mirrored?: boolean;
  hit: HitEvent | null;
}) {
  const { t } = useTranslation();
  if (!fighter) return <div className="fighter-panel fighter-placeholder" />;

  const pct = Math.max(0, Math.min(100, (fighter.hp / fighter.maxHp) * 100));
  const hpColor = pct > 50 ? "#4caf50" : pct > 20 ? "#ffb300" : "#e64a4a";
  const fainted = fighter.hp <= 0;

  const isTarget = hit?.defenderKey === fighter.key;
  const isAttacker = hit?.attackerKey === fighter.key;
  const shakeClass = isTarget && hit && hit.damage > 0 ? (hit.isCrit || hit.effectiveness === "super" ? "hit-shake-strong" : "hit-shake") : "";
  const attackClass = isAttacker ? "attack-pulse" : "";

  return (
    <div className={`fighter-panel ${fainted ? "fainted" : ""}`}>
      <div className="fighter-info">
        <span className="fighter-name">{fighter.displayName}</span>
        <span className="fighter-level">{t("battle.level", { level: fighter.level })}</span>
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
      <div className="fighter-sprite-slot">
        {isTarget && hit && (
          <span key={`flash-${hit.id}`} className={`hit-flash ${hit.effectiveness} ${hit.damage === 0 ? "miss" : ""}`} />
        )}
        {isTarget && hit && hit.damage > 0 && (
          <span key={`dmg-${hit.id}`} className={`damage-popup ${hit.isCrit ? "crit" : ""}`}>
            -{hit.damage}
          </span>
        )}
        {isTarget && hit && hit.effectiveness === "super" && (
          <span key={`fx-${hit.id}`} className="effect-label super">
            {t("battle.superEffectiveLabel")}
          </span>
        )}
        {isTarget && hit && hit.effectiveness === "not-very" && (
          <span key={`fx-${hit.id}`} className="effect-label not-very">
            {t("battle.notVeryEffectiveLabel")}
          </span>
        )}
        <span className={`fighter-sprite-flip ${mirrored ? "mirrored" : ""}`}>
          <img
            key={isTarget && hit ? `shake-${hit.id}` : isAttacker && hit ? `attack-${hit.id}` : "static"}
            src={fighter.sprite}
            alt={fighter.displayName}
            className={`fighter-sprite ${shakeClass} ${attackClass}`}
          />
        </span>
      </div>
    </div>
  );
}

export function BattlePage() {
  const { t } = useTranslation();
  const teamApi = useTeam();
  const { status, fighterA, fighterB, log, outcome, capturePending, lastHit, start, decideCapture } =
    useBattle(teamApi);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  if (teamApi.team.length === 0) {
    return (
      <div className="battle-page">
        <StarterPicker
          onPick={(name) => {
            teamApi.addMember({ slug: name, level: STARTER_LEVEL, exp: 0 });
            teamApi.setActiveIndex(0);
          }}
        />
      </div>
    );
  }

  const busy = status === "loading" || status === "fighting" || capturePending;

  return (
    <div className="battle-page">
      <TeamRoster
        team={teamApi.team}
        activeIndex={teamApi.activeIndex}
        onSelect={teamApi.setActiveIndex}
        disabled={busy}
      />

      <div className="battle-arena">
        <FighterPanel fighter={fighterB} mirrored hit={lastHit} />
        <span className="battle-vs">VS</span>
        <FighterPanel fighter={fighterA} hit={lastHit} />
      </div>

      <div className="battle-log" ref={logRef}>
        {status === "idle" && <p className="empty-note">{t("battle.idle")}</p>}
        {log.map((line, i) => (
          <p key={i} className={i === log.length - 1 ? "battle-log-latest" : ""}>
            {line}
          </p>
        ))}
      </div>

      {capturePending && fighterB && (
        <CapturePrompt
          wildDisplayName={fighterB.displayName}
          team={teamApi.team}
          isFull={teamApi.isFull}
          onDecide={decideCapture}
        />
      )}

      {!capturePending && (
        <div className="battle-controls">
          <button className="battle-start-button" disabled={busy} onClick={start}>
            {status === "loading"
              ? t("battle.loading")
              : status === "result"
                ? t("battle.restart")
                : t("battle.start")}
          </button>
          {status === "result" && outcome && (
            <span className={`battle-winner-banner ${outcome === "lose" ? "lose" : ""}`}>
              {outcome === "win" ? t("battle.outcomeWin") : t("battle.outcomeLose")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
