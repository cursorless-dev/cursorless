// Jumbotron shared primitives — used by both the serialization half
// (jumbotron.ts) and the CSS half (jumbotron-css.ts / -keyframes.ts). Kept in a
// dependency-free leaf module so the markup and CSS modules never import each
// other (avoids a cycle) and never duplicate these. render/ → render/ only.

import type { CascadeState } from "../model/frame-state";
import type { Timeline } from "../model/timeline";

export const NL = String.fromCharCode(10);

/** Commands carried by the frames, in order. */
export function frameCommands(state: CascadeState): string[] {
  return state.frames
    .map((f) => f.command)
    .filter((c): c is string => c != null && c !== "");
}

/** Timeline-relative %-formatters shared by the CSS keyframe + carousel builders.
 *  `msPct` maps absolute ms onto 0-100 of the total; `pctc` clamps+formats. */
export function timelinePct(tl: Timeline): {
  msPct: (ms: number) => number;
  pctc: (x: number) => string;
} {
  const durMs = tl.totalMs;
  const msPct = (ms: number) => (ms / durMs) * 100;
  const pctc = (x: number) => `${Math.max(0, Math.min(100, x)).toFixed(3)}%`;
  return { msPct, pctc };
}

/** Indices of frames that carry a (non-empty) command — the command-pill slots. */
export function commandFrameIndices(state: CascadeState): number[] {
  const cmdFrames: number[] = [];
  state.frames.forEach((f, i) => {
    if (f.command != null && f.command !== "") {
      cmdFrames.push(i);
    }
  });
  return cmdFrames;
}
