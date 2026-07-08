// Stage 3: generate render object. Extracted from pipeline.ts so each module
// stays under the 250-line ceiling. Assembles flashes, the DURING frame, and
// overlays from the tokenized before/after Frames into the CascadeState.
// Behavior identical to the inline stage that lived in fixtureToCascade.
// logic/ → logic/ import only.

import type { CascadeState, Frame } from "../model/types";
import type { GeneralizedRange } from "@cursorless/lib-common";
import type { OverlayStyleName } from "../data/decorations";
import { asArr, asObj, toGeneralizedRange } from "./fixture-extract";
import { deriveFlashes } from "./derive-flashes";
import { deriveOverlays } from "./derive-overlays";
import type {
  ParsedFixture,
  PipelineOptions,
  TokenizedStates,
} from "./pipeline-types";

// Route a flash style to its native frame.
function flashRidesAfter(style: string): boolean {
  return style === "justAdded";
}

/** Assemble flashes, the DURING frame, and overlays into the CascadeState. */
export function buildRenderObject(
  parsed: ParsedFixture,
  tokenized: TokenizedStates,
  _opts: PipelineOptions = {},
): CascadeState {
  const { theme, tabSize, meta, initial, final, ide } = parsed;
  const { frames, beforeFrame, afterFrame } = tokenized;

  const duringFlashes: { style: OverlayStyleName; range: GeneralizedRange }[] =
    [];

  // Step 6b (derived referenceFlashes) — see derive-flashes.ts. When a fixture
  // records no ide.flashes but the doc changed, synthesize the pre-edit
  // pendingDelete (rides DURING) + post-edit justAdded (rides AFTER) from the
  // char-level prefix/suffix diff. Behavior identical to the inline version.
  const recordedFlashes = asArr(ide?.flashes);
  const initDoc = (initial?.documentContents as string) ?? "";
  const finDoc =
    typeof final?.documentContents === "string" ? final.documentContents : null;
  const derived = deriveFlashes({
    recordedFlashCount: recordedFlashes.length,
    initDoc,
    finDoc,
    hasAfterFrame: afterFrame != null,
  });
  duringFlashes.push(...derived.duringFlashes);
  if (afterFrame) {
    afterFrame.decorations.push(...derived.afterDecorations);
  }

  // Step 6: flashes. justAdded rides the AFTER frame (post-edit); every
  // other flash is PRE-EDIT and rides the dedicated DURING frame (built
  // below) — reference-class flashes sequence before deletion flashes there.
  for (const f of asArr(ide?.flashes)) {
    const fo = asObj(f);
    if (!fo) {
      continue;
    }
    const style = String(fo.style) as OverlayStyleName;
    const range = toGeneralizedRange(asObj(fo.range) ?? {});
    if (!range) {
      continue;
    }
    if (flashRidesAfter(style) && afterFrame) {
      afterFrame.decorations.push({ style, range, role: "flash" });
    } else {
      duringFlashes.push({ style, range });
    }
  }

  // Build the DURING frame (the execution beat — the instant the command
  // pill goes active). ALWAYS present when the step has a final state, so
  // every command occupies the same time scope. Content depends on flashes:
  //   - WITH pre-edit flashes: the initial doc, flashes firing (reference
  //     half then delete half) — the edit lands at the phase end.
  //   - WITHOUT flashes (pure selection commands like "take cap"): the edit
  //     is instantaneous in a real editor, so the during frame shows the
  //     FINAL state — the selection highlight lands in the SAME frame as the
  //     pill activation.
  if (afterFrame) {
    const instant = duringFlashes.length === 0;
    const src = instant ? afterFrame : beforeFrame;
    const duringFrame: Frame = {
      role: "during",
      lines: src.lines,
      cursors: src.cursors,
      selections: src.selections,
      decorations: instant
        ? []
        : duringFlashes.map(({ style, range }) => ({
            style,
            range,
            role: "flash" as const,
          })),
      clipboard: src.clipboard,
    };
    frames.splice(1, 0, duringFrame);
  }

  // Step 7: highlights → BEFORE decorations, thatMark/sourceMark → AFTER
  // decorations. See derive-overlays.ts; behavior identical to the inline
  // version (order preserved: highlights, then that, then source).
  const overlays = deriveOverlays({
    ide,
    final,
    hasAfterFrame: afterFrame != null,
  });
  beforeFrame.decorations.push(...overlays.beforeDecorations);
  if (afterFrame) {
    afterFrame.decorations.push(...overlays.afterDecorations);
  }

  return { theme, tabSize, meta, frames };
}
