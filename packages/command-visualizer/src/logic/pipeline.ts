// Fixture → state pipeline — SPEC-v2 §2 (8 steps). Pure, deterministic.
//   yml → frames → tokenize → marks→hats → synthetic shape → flashes→overlays
//   → that/source/highlights → CascadeState. Render contract (SPEC.md §3/§4)
//   is unchanged downstream.

import { readFileSync } from "node:fs";
import type { HatColor, HatShape } from "@cursorless/lib-common";
import { parseFixtureYaml } from "./fixture-yaml";
import type { Theme } from "../data/colors";
import type {
  CascadeState,
  Frame,
  GeneralizedRange,
} from "../model/frame-state";
import type { DecorationStyle } from "../data/decorations";
import {
  asArr,
  asObj,
  buildLines,
  deriveSelections,
  parseMarks,
  toGeneralizedRange,
} from "./fixture-extract";

import { fixtureRoot } from "./fixture-root";
import { deriveFlashes } from "./derive-flashes";
import { deriveOverlays } from "./derive-overlays";

// Resolved lazily: fixtureRoot() throws when no cursorless checkout exists,
// which must not fire at module load in serverless (the API path reads
// bundled fixtures and never touches disk).
let fixtureRootCache: string | undefined;
function FIXTURE_ROOT_LAZY(): string {
  return (fixtureRootCache ??= fixtureRoot());
}

// Route a flash style to its native frame (SPEC-v2 §1.2 / §2.6).
function flashRidesAfter(style: string): boolean {
  return style === "justAdded";
}

export interface PipelineOptions {
  shapeOverride?: Record<string, HatShape>;
  theme?: Theme;
  tabSize?: number;
  /** "dense" (default) = real-allocator fill everywhere; "marks-only" = exactly the recorded marks. */
  fill?: "dense" | "marks-only";
  /** Position-keyed exact-hat overrides, keyed "{line}:{startChar}" — applied last, wins over everything. */
  hatOverride?: Record<string, { color?: HatColor; shape?: HatShape }>;
}

/** Full pipeline: fixture YAML text → CascadeState. */
export function fixtureToCascade(
  src: string,
  fixtureRel: string,
  opts: PipelineOptions = {},
): CascadeState {
  const doc = parseFixtureYaml(src);
  const theme: Theme = opts.theme ?? "dark";
  const tabSize = opts.tabSize ?? 4;

  const command = asObj(doc.command);
  const action = asObj(command?.action);
  const meta = {
    spokenForm:
      typeof command?.spokenForm === "string" ? command.spokenForm : undefined,
    action: typeof action?.name === "string" ? action.name : undefined,
    fixture: fixtureRel,
  };

  const initial = asObj(doc.initialState);
  const final = asObj(doc.finalState);

  // Clipboard visibility per state — ported from VisualizerMetadata.tsx
  // (gen_2026_01_20): cut/copy PRODUCE clipboard (visible on AFTER only);
  // paste CONSUMES it (visible on all states).
  const actionName = meta.action ?? "";
  const initClip =
    typeof initial?.clipboard === "string" ? initial.clipboard : undefined;
  const finalClip =
    typeof final?.clipboard === "string" ? final.clipboard : undefined;
  const clipProduced =
    actionName === "cutToClipboard" || actionName === "copyToClipboard";
  const clipConsumed = actionName === "pasteFromClipboard";
  const clipFor = (state: "before" | "after"): string | undefined => {
    if (clipProduced) {
      return state === "after" ? finalClip : undefined;
    }
    if (clipConsumed) {
      return initClip;
    }
    return undefined;
  };

  const ide = asObj(doc.ide);

  const initMarks = parseMarks(asObj(initial?.marks));

  // Step 2: BEFORE frame.
  const beforeLines = buildLines(
    (initial?.documentContents as string) ?? "",
    initMarks,
    {
      shapeOverride: opts.shapeOverride,
      fill: opts.fill,
      hatOverride: opts.hatOverride,
    },
  );
  const beforeSel = deriveSelections(asArr(initial?.selections));
  const beforeFrame: Frame = {
    role: "before",
    lines: beforeLines,
    cursors: beforeSel.cursors,
    selections: beforeSel.selections,
    decorations: [],
    command: meta.spokenForm,
    clipboard: clipFor("before"),
  };

  const frames: Frame[] = [beforeFrame];

  // AFTER frame (omit if no finalState — error fixtures, SPEC-v2 §2.2).
  let afterFrame: Frame | null = null;
  if (final && typeof final.documentContents === "string") {
    // Final docs ship no marks; re-tokenize identically (no hats on after).
    const afterLines = buildLines(final.documentContents, [], {
      shapeOverride: opts.shapeOverride,
      fill: opts.fill,
      hatOverride: opts.hatOverride,
    });
    const afterSel = deriveSelections(asArr(final.selections));
    afterFrame = {
      role: "after",
      lines: afterLines,
      cursors: afterSel.cursors,
      selections: afterSel.selections,
      decorations: [],
      clipboard: clipFor("after"),
    };
    frames.push(afterFrame);
  }

  const duringFlashes: { style: DecorationStyle; range: GeneralizedRange }[] =
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
    const style = String(fo.style) as DecorationStyle;
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
  const overlays = deriveOverlays({ ide, final, hasAfterFrame: afterFrame != null });
  beforeFrame.decorations.push(...overlays.beforeDecorations);
  if (afterFrame) {
    afterFrame.decorations.push(...overlays.afterDecorations);
  }

  return { theme, tabSize, meta, frames };
}

/** Convenience: load a recorded fixture by relative path. */
export function loadFixtureCascade(
  fixtureRel: string,
  opts: PipelineOptions = {},
): CascadeState {
  const src = readFileSync(`${FIXTURE_ROOT_LAZY()}/${fixtureRel}`, "utf8");
  return fixtureToCascade(src, fixtureRel, opts);
}

export { FIXTURE_ROOT_LAZY as fixtureRootPath };
