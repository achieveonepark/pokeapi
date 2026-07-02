import type { FlavorTextEntry, Genus } from "./types";

export function englishFlavorText(entries: FlavorTextEntry[]): string | null {
  const english = entries.filter((e) => e.language.name === "en");
  if (english.length === 0) return null;
  const last = english[english.length - 1];
  return last.flavor_text.replace(/[\f\n\r\t]+/g, " ").replace(/\s+/g, " ").trim();
}

export function englishGenus(genera: Genus[]): string | null {
  return genera.find((g) => g.language.name === "en")?.genus ?? null;
}
