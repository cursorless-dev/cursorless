// Cascade flash-fade CSS — DURING beats. Extracted verbatim from css-cascade.ts
// (the flash TIMING section) so the main module stays under the 250-line limit.
// render/ → render/ import only; behavior unchanged.

import {
  DECORATION_HEX,
  FLASH_PULSE_MS,
  type OverlayStyleName,
} from "../data/decorations";
import type { Frame } from "../model/frame-state";
import type { Timeline } from "../model/timeline";
import { pct } from "./css-cascade";

// DURING beats — flash TIMING. A flash is a TRANSIENT beat *within* one
// frame's timeline slot, not a static band. Two opposite directions:
//
// DELETE (pendingDelete) rides the BEFORE frame (frame 0, slot [0, 1/N]):
//   plain (band transparent)  →  hold plain  →  red band fades IN
// then the frame's opacity snap crosses to the after-frame (text gone). The band
// fades in LATE in the slot so the before-doc reads plain first, then highlights
// the doomed span just before it vanishes.
//
// ADD (justAdded) rides the AFTER frame (frame N-1, slot [(N-1)/N, 1]):
//   green band PRESENT  →  hold green  →  green band fades OUT  →  plain (text stays)
// the insert just happened, so the green is up-front when the after-frame appears,
// then fades out over the latter part of the slot leaving plain text behind. This
// is the mirror image of the delete beat (green out-front, fade to transparent vs.
// red back-end, fade in from transparent).
//
// Both animate ONLY background-color (text stays fully opaque the whole slot);
// CSS-only, zero view-time JS. Each flash style gets its own @keyframes scoped to
// its native frame, so other frames / styles keep the static band.

const ADD_FLASH_STYLES = ["justAdded"] as const;

// The flash is a FIXED 100ms pulse, pinned to cursorless's
// `pendingEditDecorationTime` (FLASH_PULSE_MS), DECOUPLED from the readability
// state-hold cadence.
//
// The cascade timeline is `--dur = N · MS_PER_STATE` ms (serialize-cascade.ts),
// so each of the N frame slots lasts MS_PER_STATE ms. Working in keyframe-% of
// the WHOLE timeline (each @keyframes runs over var(--dur)):
//   1% of timeline           = (--dur)/100 ms   = (N·MS_PER_STATE)/100 ms
//   ⇒ a P-ms window in %      = P / (N·MS_PER_STATE) · 100
// The flash's FULL-target held window is exactly FLASH_PULSE_MS ms → `pulsePct`
// below. A short fade ramp (FADE_FRAC of the pulse) softens each edge but the
// held-full-color span is exactly the pulse, which is what verify:flash-timing
// measures. Result: the pulse is ~100ms for ANY N (no slot scaling).
const FADE_FRAC = 0.4; // soft-edge ramp length as a fraction of the pulse window

// Reference-class pre-edit flashes (Bring sources/destinations etc.) — they
// sequence BEFORE deletion flashes inside a DURING window (real cursorless
// fires pre-edit flashes in parallel; sequenced here by spec).
const REFERENCE_FLASH_STYLES = [
  "referenced",
  "pendingModification0",
  "pendingModification1",
] as const;

export function flashFadeKeyframes(
  frames: readonly Frame[],
  tl: Timeline,
  pulseMs: number = FLASH_PULSE_MS,
): string {
  const out: string[] = [];
  const pct100 = (x: number) => pct(Math.max(0, Math.min(100, x * 100)));

  frames.forEach((frame, k) => {
    const lo = tl.startFrac[k];
    const hi = tl.endFrac[k];

    if (frame.role === "during") {
      // DURING window: reference flashes first, deletion flashes second.
      // Halves when both classes are present; the full window otherwise.
      const styles = new Set(frame.decorations.map((d) => d.style));
      // The during phase keeps its full duration regardless of content, but
      // the FIRST flash class present INITIATES AT THE PHASE START — the
      // same instant the command pill goes active. When reference flashes
      // exist they take the first half and deletion follows at the midpoint;
      // with deletions only, red starts with the pill and holds to the edit.
      const hasRef = REFERENCE_FLASH_STYLES.some((st) =>
        styles.has(st as OverlayStyleName),
      );
      const mid = (lo + hi) / 2;
      const refWin: [number, number] = [lo, mid];
      const delWin: [number, number] = [hasRef ? mid : lo, hi];
      const emit = (style: string, w: [number, number], holdOn: boolean) => {
        out.push(
          `@keyframes flashfade-${style}-s${k} {\n` +
            `  0% { background-color: transparent; }\n` +
            `  ${pct100(w[0])}% { background-color: transparent; }\n` +
            `  ${pct100(w[0] + 0.0001)}% { background-color: ${DECORATION_HEX[style as keyof typeof DECORATION_HEX]}; }\n` +
            `  ${pct100(w[1])}% { background-color: ${DECORATION_HEX[style as keyof typeof DECORATION_HEX]}; }\n` +
            (holdOn
              ? `  100% { background-color: ${DECORATION_HEX[style as keyof typeof DECORATION_HEX]}; }\n`
              : `  ${pct100(w[1] + 0.0001)}% { background-color: transparent; }\n  100% { background-color: transparent; }\n`) +
            `}`,
        );
      };
      for (const st of REFERENCE_FLASH_STYLES) {
        if (styles.has(st)) {
          emit(st, refWin, false);
        }
      }
      if (styles.has("pendingDelete")) {
        emit("pendingDelete", delWin, true);
      } // held to the edit
    } else {
      // ADD pulse at the frame's slot start (post-edit justAdded).
      const durFrac = pulseMs / tl.totalMs;
      const aFullEnd = Math.min(hi, lo + durFrac);
      const aFadeEnd = Math.min(hi, aFullEnd + durFrac * FADE_FRAC);
      for (const st of ADD_FLASH_STYLES) {
        out.push(
          `@keyframes flashfade-${st}-s${k} {\n` +
            `  0% { background-color: ${DECORATION_HEX[st]}; }\n` +
            `  ${pct100(lo)}% { background-color: ${DECORATION_HEX[st]}; }\n` +
            `  ${pct100(aFullEnd)}% { background-color: ${DECORATION_HEX[st]}; }\n` +
            `  ${pct100(aFadeEnd)}% { background-color: transparent; }\n` +
            `  100% { background-color: transparent; }\n` +
            `}`,
        );
      }
    }
  });

  return out.join("\n");
}

export function flashFadeRules(frames: readonly Frame[]): string {
  const rules: string[] = [];
  frames.forEach((frame, k) => {
    if (frame.role === "during") {
      const styles = new Set(frame.decorations.map((d) => d.style));
      for (const st of [...REFERENCE_FLASH_STYLES, "pendingDelete"]) {
        if (!styles.has(st as OverlayStyleName)) {
          continue;
        }
        rules.push(
          `.cl-cascade .frame[data-frame="${k}"] .ch[data-flash="${st}"] {\n` +
            `  background-color: transparent;\n` +
            `  animation: flashfade-${st}-s${k} var(--dur, 2s) linear 1 forwards paused;\n` +
            `}`,
        );
      }
    } else {
      for (const st of ADD_FLASH_STYLES) {
        rules.push(
          `.cl-cascade .frame[data-frame="${k}"] .ch[data-flash="${st}"] {\n` +
            `  background-color: ${DECORATION_HEX[st]};\n` +
            `  animation: flashfade-${st}-s${k} var(--dur, 2s) linear 1 forwards paused;\n` +
            `}`,
        );
      }
    }
  });
  return rules.join("\n");
}
