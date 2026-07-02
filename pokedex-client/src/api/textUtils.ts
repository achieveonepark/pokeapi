import type { FlavorTextEntry, Genus } from "./types";

function pickByLanguage<T extends { language: { name: string } }>(
  entries: T[],
  lang: string,
): T | null {
  const exact = entries.filter((e) => e.language.name === lang);
  if (exact.length > 0) return exact[exact.length - 1];
  const english = entries.filter((e) => e.language.name === "en");
  if (english.length > 0) return english[english.length - 1];
  return null;
}

export function localizedFlavorText(entries: FlavorTextEntry[], lang: string): string | null {
  const picked = pickByLanguage(entries, lang);
  if (!picked) return null;
  return picked.flavor_text.replace(/[\f\n\r\t]+/g, " ").replace(/\s+/g, " ").trim();
}

export function localizedGenus(genera: Genus[], lang: string): string | null {
  return pickByLanguage(genera, lang)?.genus ?? null;
}

export function localizedName(
  names: { name: string; language: { name: string } }[],
  lang: string,
  fallback: string,
): string {
  return pickByLanguage(names, lang)?.name ?? fallback;
}
