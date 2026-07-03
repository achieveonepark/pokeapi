import { useEffect, useMemo, useRef, useState } from "react";
import { usePmdAnimData } from "../hooks/usePmdAnimData";
import { dexIdToPmdId, pmdSpriteSheetUrl } from "../pmd/urls";

// Sprite sheets are laid out as 8 direction-rows x N frame-columns, in a
// fixed order: Down(0), DownRight(1), Right(2), UpRight(3), Up(4), UpLeft(5),
// Left(6), DownLeft(7). We always show one fixed direction — DownLeft
// (7-8 o'clock) reads better than straight-on Down for these battle/detail poses.
const DISPLAY_ROW = 7;
const DIRECTION_ROWS = 8;
// PMD engines run animation ticks at roughly 30fps; not exact, but close
// enough for this "rough feel" purpose.
const TICK_MS = 33;

export type PmdAnimName = "Idle" | "Attack" | "Hurt" | "Faint" | "Sleep" | "Walk";

// Anim coverage varies a lot per species — fall back down this chain rather
// than showing nothing.
const FALLBACK_CHAIN: Record<PmdAnimName, PmdAnimName[]> = {
  Idle: ["Idle"],
  Walk: ["Walk", "Idle"],
  Attack: ["Attack", "Idle"],
  Hurt: ["Hurt", "Idle"],
  Sleep: ["Sleep", "Idle"],
  Faint: ["Faint", "Sleep", "Idle"],
};

export function PmdSprite({
  dexId,
  anim,
  scale = 3,
  maxSize,
  mirrored = false,
  loop,
  onAnimEnd,
  onUnavailable,
  className,
}: {
  dexId: number;
  anim: PmdAnimName;
  scale?: number;
  /** Caps the rendered frame's width/height to this many px, scaling down as needed — keeps
   *  wildly different frame sizes (a 40x48 Idle vs. an 80x88 Attack lunge) visually consistent. */
  maxSize?: number;
  mirrored?: boolean;
  loop?: boolean;
  onAnimEnd?: () => void;
  /** Called once if this species has no usable SpriteCollab data at all, so the caller can fall back. */
  onUnavailable?: () => void;
  className?: string;
}) {
  const { data: animData, isError } = usePmdAnimData(dexId);
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);
  const notifiedUnavailable = useRef(false);

  const resolvedName = useMemo(() => {
    if (!animData) return null;
    return FALLBACK_CHAIN[anim].find((name) => animData[name]) ?? null;
  }, [animData, anim]);

  const meta = resolvedName && animData ? animData[resolvedName] : null;
  const shouldLoop = loop ?? (anim === "Idle" || anim === "Walk" || anim === "Sleep");

  useEffect(() => {
    if ((isError || (animData && !resolvedName)) && !notifiedUnavailable.current) {
      notifiedUnavailable.current = true;
      onUnavailable?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, animData, resolvedName]);

  useEffect(() => {
    setFrame(0);
    frameRef.current = 0;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (!meta) return undefined;

    const step = () => {
      const { durations } = meta;
      const nextIndex = frameRef.current + 1;
      if (nextIndex >= durations.length) {
        if (shouldLoop) {
          frameRef.current = 0;
          setFrame(0);
          timeoutRef.current = window.setTimeout(step, durations[0] * TICK_MS);
        } else {
          onAnimEnd?.();
        }
        return;
      }
      frameRef.current = nextIndex;
      setFrame(nextIndex);
      timeoutRef.current = window.setTimeout(step, durations[nextIndex] * TICK_MS);
    };

    timeoutRef.current = window.setTimeout(step, meta.durations[0] * TICK_MS);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta?.sheetName, meta?.durations.length, shouldLoop]);

  if (!meta) return null;

  const pmdId = dexIdToPmdId(dexId);
  const sheetUrl = pmdSpriteSheetUrl(pmdId, meta.sheetName);
  const cols = meta.durations.length;
  const effectiveScale = maxSize
    ? Math.min(scale, maxSize / meta.frameWidth, maxSize / meta.frameHeight)
    : scale;
  const sheetWidth = meta.frameWidth * cols * effectiveScale;
  const sheetHeight = meta.frameHeight * DIRECTION_ROWS * effectiveScale;

  return (
    <span className={`pmd-sprite-flip ${mirrored ? "mirrored" : ""} ${className ?? ""}`}>
      <span
        className="pmd-sprite"
        style={{
          width: meta.frameWidth * effectiveScale,
          height: meta.frameHeight * effectiveScale,
          backgroundImage: `url(${sheetUrl})`,
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          backgroundPosition: `-${frame * meta.frameWidth * effectiveScale}px -${DISPLAY_ROW * meta.frameHeight * effectiveScale}px`,
        }}
      />
    </span>
  );
}
