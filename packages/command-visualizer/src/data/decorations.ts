// Decoration style hexes — VERBATIM from cursorless flash/highlight palette
// (research/highlight-rendering.md §3; verified 2026-06-08). SPEC-v2 §3.1.
// All background-only; alpha baked into the 8-digit hex; theme-INVARIANT.

import { FlashStyle as CursorlessFlashStyle } from "@cursorless/lib-common";

// FlashStyle is DERIVED from @cursorless/lib-common's `FlashStyle` enum
// (ide/types/FlashDescriptor.ts) — not cloned. The template-literal type turns
// the enum's string VALUES into the union
// "pendingDelete" | "referenced" | "pendingModification0" |
// "pendingModification1" | "justAdded", so every existing string-keyed usage
// (DECORATION_HEX keys, "pendingDelete" as DecorationStyle, styles.has(...))
// keeps working with zero literal churn, while the set of valid names now
// tracks lib-common automatically. The HEX values, FLASH_PULSE_MS,
// MS_PER_STATE, and precedence remain ours (not exported by cursorless).
export type FlashStyle = `${CursorlessFlashStyle}`;

export type HighlightStyle = "highlight0" | "highlight1";

export type DecorationStyle = FlashStyle | HighlightStyle;

// All 7 decoration styles' background hexes (the 2 scope-pair styles use the
// same band hex family; per-edge borders are BONUS, SPEC-v2 §3.5, not here).
export const DECORATION_HEX: Record<DecorationStyle, string> = {
  pendingDelete: "#ff00008a", // REQUIRED (COMPLETION crit 3)
  justAdded: "#09ff005b", // REQUIRED (COMPLETION crit 3)
  referenced: "#00a2ff4d",
  pendingModification0: "#8c00ff86",
  pendingModification1: "#ff009d7e",
  highlight0: "#d449ff42",
  highlight1: "#60daff7a",
};

export const FLASH_STYLES: FlashStyle[] = [
  "pendingDelete",
  "justAdded",
  "referenced",
  "pendingModification0",
  "pendingModification1",
];

export const HIGHLIGHT_STYLES: HighlightStyle[] = ["highlight0", "highlight1"];

// Flash PULSE duration — pinned VERBATIM to cursorless's
// `cursorless.pendingEditDecorationTime` default (100ms):
//   packages/app-vscode/package.json:375              ("default": 100)
//   packages/app-vscode/src/ide/vscode/VscodeFlashHandler.ts:26
//     flashRanges(...) → await sleep(getPendingEditDecorationTime()) → clear
// A flash is a FIXED 100ms pulse, decoupled from the readability state-hold
// cadence (SPEC-v2 §4.2, B2/B6). Both the delete (pendingDelete) and insert
// (justAdded) beats are pinned to this. verify:flash-timing is the oracle.
export const FLASH_PULSE_MS = 100;

// Real-time duration of one readability state-hold slot, in ms. The cascade
// timeline is `--dur = N · MS_PER_STATE` (serialize-cascade.ts), so each of the
// N frame slots lasts exactly MS_PER_STATE ms regardless of N. The flash pulse
// (FLASH_PULSE_MS) is pinned in absolute ms and is INDEPENDENT of this cadence —
// changing MS_PER_STATE rescales the state-hold but never the 100ms flash.
export const MS_PER_STATE = 1000;

export const ALL_DECORATION_STYLES: DecorationStyle[] = [
  ...FLASH_STYLES,
  ...HIGHLIGHT_STYLES,
];

// Single-winner precedence (SPEC-v2 §3.2, DECISIONS §7.1): selection < highlight
// < flash, last wins; exactly ONE background per cell. Higher number wins.
export function overlayPrecedence(
  style: DecorationStyle | "selection",
): number {
  if (style === "selection") {
    return 0;
  }
  if (HIGHLIGHT_STYLES.includes(style as HighlightStyle)) {
    return 1;
  }
  return 2; // flash
}
