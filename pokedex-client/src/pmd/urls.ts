// Community-maintained Pokemon Mystery Dungeon-style sprites/portraits.
// https://github.com/PMDCollab/SpriteCollab — CC BY-NC 4.0, credit required.
const BASE = "https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master";

/** SpriteCollab keys assets by zero-padded National Dex number (matches PokeAPI's `pokemon.id` for base forms). */
export function dexIdToPmdId(dexId: number): string {
  return String(dexId).padStart(4, "0");
}

export function pmdAnimDataUrl(pmdId: string): string {
  return `${BASE}/sprite/${pmdId}/AnimData.xml`;
}

export function pmdSpriteSheetUrl(pmdId: string, sheetName: string): string {
  return `${BASE}/sprite/${pmdId}/${sheetName}-Anim.png`;
}

export function pmdPortraitUrl(pmdId: string, emotion = "Normal"): string {
  return `${BASE}/portrait/${pmdId}/${emotion}.png`;
}
