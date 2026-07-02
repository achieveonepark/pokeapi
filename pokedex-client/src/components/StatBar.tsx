import { useTranslation } from "react-i18next";
import { STAT_MAX } from "../api/typeColors";

export function StatBar({ statName, value }: { statName: string; value: number }) {
  const { t } = useTranslation();
  const pct = Math.min(100, (value / STAT_MAX) * 100);
  const color = value >= 100 ? "#4caf50" : value >= 60 ? "#ffb300" : "#e64a4a";

  return (
    <div className="stat-row">
      <span className="stat-label">{t(`stats.${statName}`, { defaultValue: statName })}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
