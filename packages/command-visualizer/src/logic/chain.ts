// Multi-step chain semantics (Trillium's model, 2026-07-07):
//
//   every entry:  initialState / referenceFlashes[] / finalState
//   chained:      finalState.i and initialState.{i+1} MUST agree, and the
//                 hats from initialState.{i+1} flow BACKWARD onto that
//                 boundary — in cursorless the transition is ONE animated
//                 change, not two. finalState.i is never rendered with its
//                 own hats; the merged frame IS initialState.{i+1}.
//
// Frame list for an n-step chain:  [before_0, before_1, ..., before_{n-1}, after_{n-1}]
// where each merged frame before_{i+1}:
//   - renders step {i+1}'s initialState (hats = its marks + real allocation),
//   - inherits step i's AFTER-riding decorations (justAdded flashes, thatMark
//     references) — they light at the merged frame's slot START,
//   - keeps its own BEFORE-riding decorations (pendingDelete) — they light at
//     the merged frame's slot END,
//   - carries step i's produced clipboard when step {i+1} has none.

import type { CascadeState, Frame } from "./frame-state";

/**
 * Pre-gif / post-gif bumpers: a 500ms PRE frame (initial state, before step 0
 * begins) and a 500ms RESET frame (re-shows the initial state so the infinite
 * loop wraps onto identical pixels). Applied to every animated cascade.
 */
export function withBumpers(state: CascadeState): CascadeState {
  if (state.frames.length < 2) {
    return state;
  }
  const first = state.frames[0];
  const clone = (flags: Partial<Frame>): Frame => ({
    role: "after",
    lines: first.lines,
    cursors: first.cursors,
    selections: first.selections,
    decorations: [],
    clipboard: first.clipboard,
    ...flags,
  });
  return {
    ...state,
    frames: [
      clone({ role: "before", pre: true }),
      ...state.frames,
      clone({ reset: true }),
    ],
  };
}

export class ChainContinuityError extends Error {
  constructor(
    public stepIndex: number,
    message: string,
  ) {
    super(message);
  }
}

/** Reconstruct a frame's document text from its render tokens (GATE 0 exact). */
export function frameDocText(frame: Frame): string {
  return frame.lines
    .map((line) => line.tokens.map((t) => t.text).join(""))
    .join("\n");
}

/**
 * Merge per-step cascades ([before, after] each) into one chain cascade.
 * Throws ChainContinuityError when finalState.i !== initialState.{i+1}.
 */
export function chainCascades(
  states: CascadeState[],
  fixtureLabel: string,
): CascadeState {
  if (states.length === 0) {
    throw new ChainContinuityError(0, "chainCascades requires at least one state");
  }
  if (states.length === 1) {
    return { ...states[0], meta: { ...states[0].meta, fixture: fixtureLabel } };
  }

  const frames: Frame[] = [];
  for (let i = 0; i < states.length; i++) {
    const step = states[i];
    const before = step.frames.find((f) => f.role === "before");
    const after = step.frames.find((f) => f.role === "after");
    if (!before) {
      throw new ChainContinuityError(i, `step ${i} has no before frame`);
    }

    if (i > 0) {
      const prevAfter = states[i - 1].frames.find((f) => f.role === "after");
      if (!prevAfter) {
        throw new ChainContinuityError(
          i - 1,
          `step ${i - 1} has no finalState to chain from`,
        );
      }
      const prevDoc = frameDocText(prevAfter);
      const thisDoc = frameDocText(before);
      if (prevDoc !== thisDoc) {
        throw new ChainContinuityError(
          i,
          `chain discontinuity between steps ${i - 1} and ${i}: ` +
            `finalState.${i - 1} and initialState.${i} must agree. ` +
            `finalState.${i - 1}=${JSON.stringify(prevDoc).slice(0, 80)} ` +
            `initialState.${i}=${JSON.stringify(thisDoc).slice(0, 80)}`,
        );
      }
      // Backward hat flow: the merged frame IS this step's before (its
      // hats). Step i-1's AFTER-riding decorations + clipboard transfer
      // onto it; prevAfter itself is never rendered.
      before.decorations = [...prevAfter.decorations, ...before.decorations];
      if (before.clipboard == null && prevAfter.clipboard != null) {
        before.clipboard = prevAfter.clipboard;
      }
    }
    frames.push(before);

    // The step's DURING phase (pre-edit flash window) rides between its
    // initial and the next merged frame.
    const during = step.frames.find((f) => f.role === "during");
    if (during) {
      frames.push(during);
    }

    if (i === states.length - 1) {
      if (after) {
        frames.push(after);
      }
    }
  }

  return {
    ...states[0],
    meta: { fixture: fixtureLabel },
    frames,
  };
}
