// Step 7 overlays — highlights + thatMark/sourceMark → decorations. Extracted
// verbatim from pipeline.ts so fixtureToCascade stays under the 250-line limit.
// Pure: reads the fixture ide/finalState objects, returns the decorations to
// append (before-frame highlights, after-frame that/source). No mutation of
// caller state. logic/ → logic/ import only.

import type { OverlayStyleName } from "../data/decorations";
import type { Decoration } from "../model/frame-state";
import {
  asArr,
  asObj,
  pos,
  toGeneralizedRange,
  type Obj,
} from "./fixture-extract";

export interface OverlayDecorations {
  /** highlight decorations to append to the BEFORE frame. */
  beforeDecorations: Decoration[];
  /** that/source decorations to append to the AFTER frame. */
  afterDecorations: Decoration[];
}

/**
 * Step 7: highlights → BEFORE decorations (painted on before frame in this
 * corpus); thatMark / sourceMark → AFTER decorations (rendered as referenced).
 * The after list is only populated when the step has an after frame.
 */
export function deriveOverlays(args: {
  ide: Obj | null;
  final: Obj | null;
  hasAfterFrame: boolean;
}): OverlayDecorations {
  const { ide, final, hasAfterFrame } = args;
  const beforeDecorations: Decoration[] = [];
  const afterDecorations: Decoration[] = [];

  // Step 7: highlights → decorations (painted on before frame in this corpus).
  for (const h of asArr(ide?.highlights)) {
    const ho = asObj(h);
    if (!ho) {
      continue;
    }
    const style = String(ho.style) as OverlayStyleName;
    for (const r of asArr(ho.ranges)) {
      const range = toGeneralizedRange(asObj(r) ?? {});
      if (range) {
        beforeDecorations.push({ style, range, role: "highlight" });
      }
    }
  }

  // Step 7: thatMark / sourceMark → AFTER decorations (rendered as referenced).
  if (hasAfterFrame) {
    for (const tm of asArr(final?.thatMark)) {
      const o = asObj(tm);
      const cr = asObj(o?.contentRange);
      if (cr) {
        afterDecorations.push({
          style: "referenced",
          role: "that",
          range: {
            type: "character",
            start: pos(cr.start),
            end: pos(cr.end),
          },
        });
      }
    }
    for (const sm of asArr(final?.sourceMark)) {
      const o = asObj(sm);
      const cr = asObj(o?.contentRange);
      if (cr) {
        afterDecorations.push({
          style: "pendingModification0",
          role: "source",
          range: {
            type: "character",
            start: pos(cr.start),
            end: pos(cr.end),
          },
        });
      }
    }
  }

  return { beforeDecorations, afterDecorations };
}
