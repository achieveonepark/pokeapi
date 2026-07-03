export interface PmdAnimMeta {
  name: string;
  /** The sheet file to fetch — differs from `name` when this anim is a <CopyOf> another one. */
  sheetName: string;
  frameWidth: number;
  frameHeight: number;
  /** Per-frame duration, in PMD "ticks" (see TICK_MS). */
  durations: number[];
}

export type PmdAnimDataMap = Record<string, PmdAnimMeta>;
