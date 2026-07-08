// Derived referenceFlashes. Extracted verbatim from
// pipeline.ts so fixtureToCascade stays under the 250-line limit. Pure: takes
// the two document snapshots, returns the flashes to synthesize. No I/O, no
// mutation of caller state. logic/ → logic/ import only.

import type { OverlayStyleName } from "../data/decorations";
import type { Decoration, GeneralizedRange } from "../model/frame-state";
import type { Pos } from "../model/geometry";

export interface DerivedFlashes {
  /** pendingDelete flashes to append to the DURING flash list (pre-edit). */
  duringFlashes: { style: OverlayStyleName; range: GeneralizedRange }[];
  /** justAdded flash decorations to push onto the AFTER frame (post-edit). */
  afterDecorations: Decoration[];
}

/**
 * Derived referenceFlashes: tutorial-corpus recordings carry NO
 * ide.flashes (all 10 tutorial-1-basics fixtures have zero) even for document
 * edits. Cursorless flashes are deterministic from
 * the edit itself, so when a fixture records none and the doc changed,
 * derive them: char-level common prefix/suffix -> removed span flashes
 * pendingDelete on BEFORE, inserted span flashes justAdded on AFTER.
 *
 * Returns empty lists (no synthesis) when the guard conditions don't hold:
 * the fixture recorded flashes, there is no final doc, the doc is unchanged,
 * or there is no after frame to attach the justAdded flash to.
 */
export function deriveFlashes(args: {
  recordedFlashCount: number;
  initDoc: string;
  finDoc: string | null;
  hasAfterFrame: boolean;
}): DerivedFlashes {
  const { recordedFlashCount, initDoc, finDoc, hasAfterFrame } = args;
  const duringFlashes: { style: OverlayStyleName; range: GeneralizedRange }[] =
    [];
  const afterDecorations: Decoration[] = [];

  if (
    recordedFlashCount === 0 &&
    finDoc != null &&
    finDoc !== initDoc &&
    hasAfterFrame
  ) {
    const toPos = (doc: string, off: number): Pos => {
      const upto = doc.slice(0, off);
      const line = (upto.match(/\n/g) ?? []).length;
      const character = off - (upto.lastIndexOf("\n") + 1);
      return { line, character };
    };
    let p = 0;
    while (
      p < initDoc.length &&
      p < finDoc.length &&
      initDoc[p] === finDoc[p]
    ) {
      p++;
    }
    let sfx = 0;
    while (
      sfx < initDoc.length - p &&
      sfx < finDoc.length - p &&
      initDoc[initDoc.length - 1 - sfx] === finDoc[finDoc.length - 1 - sfx]
    ) {
      sfx++;
    }
    const remEnd = initDoc.length - sfx;
    const insEnd = finDoc.length - sfx;
    if (remEnd > p) {
      duringFlashes.push({
        style: "pendingDelete" as OverlayStyleName,
        range: {
          type: "character",
          start: toPos(initDoc, p),
          end: toPos(initDoc, remEnd),
        },
      });
    }
    if (insEnd > p) {
      afterDecorations.push({
        style: "justAdded" as OverlayStyleName,
        role: "flash",
        range: {
          type: "character",
          start: toPos(finDoc, p),
          end: toPos(finDoc, insEnd),
        },
      });
    }
  }

  return { duringFlashes, afterDecorations };
}
