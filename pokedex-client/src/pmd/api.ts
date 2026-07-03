import { parsePmdAnimData } from "./parse";
import type { PmdAnimDataMap } from "./types";
import { dexIdToPmdId, pmdAnimDataUrl } from "./urls";

export async function fetchPmdAnimData(dexId: number): Promise<PmdAnimDataMap> {
  const pmdId = dexIdToPmdId(dexId);
  const res = await fetch(pmdAnimDataUrl(pmdId));
  if (!res.ok) {
    throw new Error(`No SpriteCollab data for dex #${pmdId} (${res.status})`);
  }
  return parsePmdAnimData(await res.text());
}
