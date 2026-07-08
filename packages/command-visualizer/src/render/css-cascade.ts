// Cascade + overlay CSS — SPEC-v2 §3 (highlight bands) + §4 (stacked-frame
// opacity timeline). Generated from the single-sourced decoration hexes so the
// band colors never drift. Theme-INVARIANT (background-only translucent hexes).

import { DECORATION_HEX, ALL_DECORATION_STYLES } from "../data/decorations";
import { FLASH_STYLES, HIGHLIGHT_STYLES } from "../data/decorations";
import { FLASH_PULSE_MS } from "../data/decorations";
import type { Frame } from "../model/frame-state";
import { timelineOf, type Timeline } from "../model/timeline";
import { flashFadeKeyframes, flashFadeRules } from "./css-cascade-flash";

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

// Shared %-formatter — used here (frameKeyframes) and by the extracted
// flash-fade module. Exported so css-cascade-flash.ts reuses the exact impl
// (render/ → render/ import; no duplication).
export const pct = (x: number): string => x.toFixed(3);

// The flash TIMING section (DURING beats: delete R2-i, insert R2-ii, reference
// pre-edit flashes) lives in ./css-cascade-flash — imported above. See that
// module's header for the full SPEC-v2 §4.2 rationale.

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
