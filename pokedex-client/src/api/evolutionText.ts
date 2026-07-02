import type { TFunction } from "i18next";
import type { EvolutionDetail } from "./types";

export function describeEvolution(detail: EvolutionDetail, t: TFunction): string {
  const parts: string[] = [];

  switch (detail.trigger?.name) {
    case "level-up":
      if (detail.min_level) parts.push(t("evolution.level", { level: detail.min_level }));
      else parts.push(t("evolution.levelUp"));
      break;
    case "trade":
      parts.push(
        detail.trade_species
          ? t("evolution.tradeFor", { species: detail.trade_species.name.replace(/-/g, " ") })
          : t("evolution.trade"),
      );
      break;
    case "use-item":
      parts.push(
        t("evolution.useItem", {
          item: detail.item?.name.replace(/-/g, " ") ?? "",
        }),
      );
      break;
    default:
      if (detail.trigger?.name) parts.push(detail.trigger.name.replace(/-/g, " "));
  }

  if (detail.item && detail.trigger?.name !== "use-item") {
    parts.push(t("evolution.holdingUsing", { item: detail.item.name.replace(/-/g, " ") }));
  }
  if (detail.min_happiness) parts.push(t("evolution.happiness", { value: detail.min_happiness }));
  if (detail.min_beauty) parts.push(t("evolution.beauty", { value: detail.min_beauty }));
  if (detail.min_affection) parts.push(t("evolution.affection", { value: detail.min_affection }));
  if (detail.held_item)
    parts.push(t("evolution.holding", { item: detail.held_item.name.replace(/-/g, " ") }));
  if (detail.known_move)
    parts.push(t("evolution.knowsMove", { move: detail.known_move.name.replace(/-/g, " ") }));
  if (detail.known_move_type)
    parts.push(t("evolution.knowsType", { type: detail.known_move_type.name }));
  if (detail.time_of_day) parts.push(t("evolution.atTime", { time: detail.time_of_day }));
  if (detail.needs_overworld_rain) parts.push(t("evolution.rain"));

  return parts.length ? parts.join(", ") : t("evolution.special");
}
