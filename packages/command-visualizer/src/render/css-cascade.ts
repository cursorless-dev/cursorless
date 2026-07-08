// Cascade + overlay CSS — SPEC-v2 §3 (highlight bands) + §4 (stacked-frame
// opacity timeline). Generated from the single-sourced decoration hexes so the
// band colors never drift. Theme-INVARIANT (background-only translucent hexes).

import { DECORATION_HEX, ALL_DECORATION_STYLES } from "../data/decorations";
import { FLASH_STYLES, HIGHLIGHT_STYLES } from "../data/decorations";
import { FLASH_PULSE_MS } from "../data/decorations";
import type { Frame } from "../model/frame-state";
import { timelineOf, type Timeline } from "../model/timeline";

// §3.2 — char-range bands on the per-char grid (one bg attr per .ch).
// The STATIC path (single-frame PNG renders, animate=false): the band is just a
// solid background-color, present for the whole frame. Used by Phase-3 PNG tests.
function charBandRules(): string {
  const flash = FLASH_STYLES.map(
    (s) => `.ch[data-flash="${s}"] { background-color: ${DECORATION_HEX[s]}; }`,
  );
  const hl = HIGHLIGHT_STYLES.map(
    (s) => `.ch[data-hl="${s}"] { background-color: ${DECORATION_HEX[s]}; }`,
  );
  return [...flash, ...hl].join("\n");
}

// §4.2 DURING beats — flash TIMING. A flash is a TRANSIENT beat *within* one
// frame's timeline slot, not a static band. Two opposite directions:
//
// DELETE (R2-i, pendingDelete) rides the BEFORE frame (frame 0, slot [0, 1/N]):
//   plain (band transparent)  →  hold plain  →  red band fades IN
// then the frame's opacity snap crosses to the after-frame (text gone). The band
// fades in LATE in the slot so the before-doc reads plain first, then highlights
// the doomed span just before it vanishes.
//
// ADD (R2-ii, justAdded) rides the AFTER frame (frame N-1, slot [(N-1)/N, 1]):
//   green band PRESENT  →  hold green  →  green band fades OUT  →  plain (text stays)
// the insert just happened, so the green is up-front when the after-frame appears,
// then fades out over the latter part of the slot leaving plain text behind. This
// is the mirror image of the delete beat (green out-front, fade to transparent vs.
// red back-end, fade in from transparent).
//
// Both animate ONLY background-color (text stays fully opaque the whole slot);
// CSS-only, zero view-time JS. Each flash style gets its own @keyframes scoped to
// its native frame, so other frames / styles keep the static band.
const pct = (x: number): string => x.toFixed(3);

const DELETE_FLASH_STYLES = ["pendingDelete"] as const;
const ADD_FLASH_STYLES = ["justAdded"] as const;

// B2/B6 FIX — the flash is a FIXED 100ms pulse, pinned to cursorless's
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

function flashFadeKeyframes(
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
        styles.has(st as never),
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

function flashFadeRules(frames: readonly Frame[]): string {
  const rules: string[] = [];
  frames.forEach((frame, k) => {
    if (frame.role === "during") {
      const styles = new Set(frame.decorations.map((d) => d.style));
      for (const st of [...REFERENCE_FLASH_STYLES, "pendingDelete"]) {
        if (!styles.has(st as never)) {
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

// §3.4 — full-width line-range bands on .cl-line (content box, DECISIONS §7.7).
function lineBandRules(): string {
  return ALL_DECORATION_STYLES.map(
    (s) =>
      `.cl-line[data-line-flash="${s}"] { background-color: ${DECORATION_HEX[s]}; display: block; width: 100%; }`,
  ).join("\n");
}

// §4.2 — per-frame opacity timeline. Frame k of N is opaque on [k/N,(k+1)/N).
// steps(1,end) gives a hard BEFORE→AFTER snap (no ghosty in-between).
function frameKeyframes(tl: Timeline): string {
  const n = tl.startFrac.length;
  if (n <= 1) {
    return `@keyframes f0 { 0%{opacity:1} 100%{opacity:1} }`;
  }
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    const lo = tl.startFrac[k] * 100;
    const hi = tl.endFrac[k] * 100;
    if (k === 0) {
      out.push(
        `@keyframes f0 { 0%{opacity:1} ${pct(hi)}%{opacity:1} ${pct(hi + 0.001)}%{opacity:0} 100%{opacity:0} }`,
      );
    } else if (k === n - 1) {
      out.push(
        `@keyframes f${k} { 0%{opacity:0} ${pct(lo)}%{opacity:0} ${pct(lo + 0.001)}%{opacity:1} 100%{opacity:1} }`,
      );
    } else {
      out.push(
        `@keyframes f${k} { 0%{opacity:0} ${pct(lo)}%{opacity:0} ${pct(lo + 0.001)}%{opacity:1} ${pct(hi)}%{opacity:1} ${pct(hi + 0.001)}%{opacity:0} 100%{opacity:0} }`,
      );
    }
  }
  return out.join("\n");
}

export function cascadeStyleSheet(
  frames: readonly Frame[],
  flashPulseMs: number = FLASH_PULSE_MS,
): string {
  const n = Math.max(1, frames.length);
  const tl = timelineOf(frames);
  // Only multi-frame cascades get the timed DURING beat; n<=1 single-frame
  // renders keep the pure-static band (Phase-3 PNG tests must stay green).
  const animated = n >= 2;
  const flashFade = animated
    ? `\n/* ---- DURING beats: delete (R2-i) + insert (R2-ii) flash-timing (SPEC-v2 §4.2) ---- */\n${flashFadeKeyframes(frames, tl, flashPulseMs)}\n${flashFadeRules(frames)}\n`
    : "";
  return `/* ---- decoration overlay layer (SPEC-v2 §3) ---- */
${charBandRules()}
${lineBandRules()}
${flashFade}

/* ---- cascade container + stacked frames (SPEC-v2 §4.1) ---- */
.cl-cascade {
  position: relative;
  display: inline-block;
  min-width: 100%;
  box-sizing: border-box;
  background: var(--editor-bg, #1e1e1e);
  border-radius: 10px;
  overflow: hidden;
  padding: 1.2em 1em 1.6em;
}
.cl-cascade .frame {
  position: absolute;
  inset: 1.2em 1em 1.6em;
  opacity: 0;
  animation: f0 var(--dur, 2s) steps(1, end) 1 forwards paused;
}
/* the FIRST frame establishes the container height (in normal flow) */
.cl-cascade .frame[data-frame="0"] { position: relative; inset: auto; }

/* inherit the editor surface chrome onto the cascade box via data-theme */
.cl-cascade[data-theme] { color: var(--editor-fg, #d4d4d4); }
.cl-cascade .cl-code {
  font-family: "JetBrains Mono", "SF Mono", "Menlo", ui-monospace, monospace;
  font-size: 18px;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
  letter-spacing: 0;
  line-height: var(--code-line-height, 1.35);
  white-space: pre;
}

/* ---- per-frame opacity timeline (SPEC-v2 §4.2) ---- */
${frameKeyframes(tl)}

/* the static (non-animated) default: show the LAST frame so a no-capture view
   still reads as the end state; capture harness seeks each slot. */
.cl-cascade .frame { animation-play-state: paused; }
.cl-cascade .frame[data-frame="${n - 1}"] { opacity: 1; }
`;
}

// Map cascade theme vars onto the cascade box (so .cl-cascade gets --editor-bg).
// The base styleSheet() already defines .cl-editor[data-theme]; mirror it here.
export function cascadeThemeBridge(): string {
  return `.cl-cascade[data-theme="dark"]  { --editor-bg:#1e1e1e; --editor-fg:#d4d4d4; --editor-sel:#264f78; --editor-caret:#aeafad; }
.cl-cascade[data-theme="light"] { --editor-bg:#ffffff; --editor-fg:#1f1f1f; --editor-sel:#add6ff; --editor-caret:#000000; }`;
}
