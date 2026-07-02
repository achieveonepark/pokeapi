import type { EvolutionDetail } from "./types";

export function describeEvolution(detail: EvolutionDetail): string {
  const parts: string[] = [];

  switch (detail.trigger?.name) {
    case "level-up":
      if (detail.min_level) parts.push(`Lv. ${detail.min_level}`);
      else parts.push("Level up");
      break;
    case "trade":
      parts.push(detail.trade_species ? `Trade for ${detail.trade_species.name}` : "Trade");
      break;
    case "use-item":
      parts.push(detail.item ? `Use ${detail.item.name.replace(/-/g, " ")}` : "Use item");
      break;
    default:
      if (detail.trigger?.name) parts.push(detail.trigger.name.replace(/-/g, " "));
  }

  if (detail.item && detail.trigger?.name !== "use-item") {
    parts.push(`holding/using ${detail.item.name.replace(/-/g, " ")}`);
  }
  if (detail.min_happiness) parts.push(`happiness ${detail.min_happiness}+`);
  if (detail.min_beauty) parts.push(`beauty ${detail.min_beauty}+`);
  if (detail.min_affection) parts.push(`affection ${detail.min_affection}+`);
  if (detail.held_item) parts.push(`holding ${detail.held_item.name.replace(/-/g, " ")}`);
  if (detail.known_move) parts.push(`knows ${detail.known_move.name.replace(/-/g, " ")}`);
  if (detail.known_move_type) parts.push(`knows a ${detail.known_move_type.name} move`);
  if (detail.time_of_day) parts.push(`at ${detail.time_of_day}`);
  if (detail.needs_overworld_rain) parts.push("while raining");

  return parts.length ? parts.join(", ") : "Special condition";
}
