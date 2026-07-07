// Weighted step timeline (Trillium spec, 2026-07-07). Frame phase names:
//
//   pre               500ms   pre-gif bumper (initial state, no command)
//   step0.initial    2000ms
//   step0.during[]   1000ms   pre-edit flashes, SEQUENCED: reference-class
//                            flashes first, deletion flashes second. (Real
//                            cursorless fires pre-edit flashes in PARALLEL —
//                            Remove awaits pendingDelete, Bring awaits
//                            referenced+pendingModification0 together, all
//                            BEFORE the edit; justAdded fires after. The
//                            sequencing here is a deliberate pedagogical
//                            refinement of that parallel reality.)
//   step0.final      2000ms   == step1.initial in a chain (merged frame,
//   step1.during[]            backward hat flow)
//   ...
//   stepN.final      2000ms
//   reset/post        500ms   seamless-loop post-gif bumper
//
// EVERY command occupies the same time scope (initial + during + final),
// whether it has zero or multiple flash states — the during phase is
// structural, with the reference sub-window always reserved.

import type { Frame } from "./frame-state";

export const INITIAL_MS = 2000;
export const DURING_MS = 1000;
/** Pre-gif / post-gif breathing room (the pre frame and the reset frame). */
export const BUMPER_MS = 500;

export function frameDurMs(frame: Frame): number {
  if (frame.durMs != null) {
    return frame.durMs;
  }
  if (frame.pre || frame.reset) {
    return BUMPER_MS;
  }
  return frame.role === "during" ? DURING_MS : INITIAL_MS;
}

export interface Timeline {
  totalMs: number;
  /** Per-frame [startMs, endMs). */
  startMs: number[];
  endMs: number[];
  /** Per-frame [startFrac, endFrac) of the whole timeline (0..1). */
  startFrac: number[];
  endFrac: number[];
}

export function timelineOf(frames: readonly Frame[]): Timeline {
  const startMs: number[] = [];
  const endMs: number[] = [];
  let t = 0;
  for (const f of frames) {
    startMs.push(t);
    t += frameDurMs(f);
    endMs.push(t);
  }
  return {
    totalMs: t,
    startMs,
    endMs,
    startFrac: startMs.map((s) => s / t),
    endFrac: endMs.map((e) => e / t),
  };
}
