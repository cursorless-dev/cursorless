// Jumbotron shared primitives — used by both the serialization half
// (jumbotron.ts) and the CSS half (jumbotron-css.ts / -keyframes.ts). Kept in a
// dependency-free leaf module so the markup and CSS modules never import each
// other (avoids a cycle) and never duplicate these. render/ → render/ only.

import type { Timeline } from "../model/timeline";
import type { CascadeState } from "../model/types";

export const NL = String.fromCodePoint(10);

/** Commands carried by the frames, in order. */
export function frameCommands(state: CascadeState): string[] {
  return state.frames
    .map((f) => f.command)
    .filter((c): c is string => c != null && c !== "");
}

function pctc(x: number): string {
  return `${Math.max(0, Math.min(100, x)).toFixed(3)}%`;
}

/** Timeline-relative %-formatters shared by the CSS keyframe + carousel builders.
 *  `msPct` maps absolute ms onto 0-100 of the total; `pctc` clamps+formats. */
export function timelinePct(tl: Timeline): {
  msPct: (ms: number) => number;
  pctc: (x: number) => string;
} {
  const durMs = tl.totalMs;
  const msPct = (ms: number) => (ms / durMs) * 100;
  return { msPct, pctc };
}

/** Indices of frames that carry a (non-empty) command — the command-pill slots. */
export function commandFrameIndices(state: CascadeState): number[] {
  const cmdFrames: number[] = [];
  for (let i = 0; i < state.frames.length; i++) {
    const f = state.frames[i];
    if (f.command != null && f.command !== "") {
      cmdFrames.push(i);
    }
  }
  return cmdFrames;
}
