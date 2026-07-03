import type { PmdAnimDataMap } from "./types";

interface RawAnim {
  name: string;
  frameWidth?: number;
  frameHeight?: number;
  durations?: number[];
  copyOf?: string;
}

function numberOrUndefined(text: string | null | undefined): number | undefined {
  if (!text) return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

/** Parses a SpriteCollab AnimData.xml into a map of anim name -> resolved frame metadata. */
export function parsePmdAnimData(xmlText: string): PmdAnimDataMap {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) return {};

  const raw = new Map<string, RawAnim>();
  for (const el of Array.from(doc.querySelectorAll("Anims > Anim"))) {
    const name = el.querySelector("Name")?.textContent?.trim();
    if (!name) continue;
    raw.set(name, {
      name,
      copyOf: el.querySelector("CopyOf")?.textContent?.trim() || undefined,
      frameWidth: numberOrUndefined(el.querySelector("FrameWidth")?.textContent),
      frameHeight: numberOrUndefined(el.querySelector("FrameHeight")?.textContent),
      durations: Array.from(el.querySelectorAll("Durations > Duration")).map(
        (d) => numberOrUndefined(d.textContent) ?? 1,
      ),
    });
  }

  const resolved: PmdAnimDataMap = {};
  for (const [name, entry] of raw) {
    let current = entry;
    let sheetName = name;
    for (let depth = 0; current.copyOf && depth < 5; depth++) {
      const next = raw.get(current.copyOf);
      if (!next) break;
      sheetName = current.copyOf;
      current = next;
    }
    if (current.frameWidth && current.frameHeight && current.durations?.length) {
      resolved[name] = {
        name,
        sheetName,
        frameWidth: current.frameWidth,
        frameHeight: current.frameHeight,
        durations: current.durations,
      };
    }
  }
  return resolved;
}
