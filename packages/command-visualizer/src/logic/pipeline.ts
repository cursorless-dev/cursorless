// Fixture → state pipeline. Pure, deterministic.
//   yml → frames → tokenize → marks→hats → synthetic shape → flashes→overlays
//   → that/source/highlights → CascadeState. The render contract is unchanged
//   downstream.
//
// The public `fixtureToCascade` is a thin composition of three named stages:
//   1. parseFixture      — YAML text → ParsedFixture (doc + meta + clipboard)
//   2. tokenizeStates    — ParsedFixture → before/after Frames (lines + hats)
//   3. buildRenderObject — Frames → CascadeState (flashes, during, overlays)
// Each stage is exported so a reviewer can read the progression top-to-bottom.
// Stage 3 lives in ./build-render-object; its types in ./pipeline-types.

import { readFileSync } from "node:fs";
import { parseFixtureYaml } from "./fixture-yaml";
import type { Theme } from "../data/colors";
import type { CascadeState, Frame } from "../model/frame-state";
import {
  asArr,
  asObj,
  buildLines,
  deriveSelections,
  parseMarks,
} from "./fixture-extract";

import { fixtureRoot } from "./fixture-root";
import { buildRenderObject } from "./build-render-object";
import type {
  ParsedFixture,
  PipelineOptions,
  TokenizedStates,
} from "./pipeline-types";

export { buildRenderObject };
export type { ParsedFixture, PipelineOptions, TokenizedStates };

// Resolved lazily: fixtureRoot() throws when no cursorless checkout exists,
// which must not fire at module load in serverless (the API path reads
// bundled fixtures and never touches disk).
let fixtureRootCache: string | undefined;
function fixtureRootLazy(): string {
  return (fixtureRootCache ??= fixtureRoot());
}

// ── Stage 1: get what to render ──────────────────────────────────────────────
/** Parse fixture YAML and resolve meta + per-state clipboard visibility. */
export function parseFixture(
  src: string,
  fixtureRel: string,
  opts: PipelineOptions = {},
): ParsedFixture {
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

  // Clipboard visibility per state — ported from cursorless's
  // VisualizerMetadata.tsx: cut/copy PRODUCE clipboard (visible on AFTER only);
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

  return { theme, tabSize, meta, initial, final, ide: asObj(doc.ide), clipFor };
}

// ── Stage 2: tokenize each step ──────────────────────────────────────────────
/** Tokenize the before (+ after) documents into Frames with lines + hats. */
export function tokenizeStates(
  parsed: ParsedFixture,
  opts: PipelineOptions = {},
): TokenizedStates {
  const { initial, final, clipFor } = parsed;
  const buildOpts = {
    shapeOverride: opts.shapeOverride,
    fill: opts.fill,
    hatOverride: opts.hatOverride,
  };
  const initMarks = parseMarks(asObj(initial?.marks));

  // Step 2: BEFORE frame.
  const beforeLines = buildLines(
    (initial?.documentContents as string) ?? "",
    initMarks,
    buildOpts,
  );
  const beforeSel = deriveSelections(asArr(initial?.selections));
  const beforeFrame: Frame = {
    role: "before",
    lines: beforeLines,
    cursors: beforeSel.cursors,
    selections: beforeSel.selections,
    decorations: [],
    command: parsed.meta.spokenForm,
    clipboard: clipFor("before"),
  };

  const frames: Frame[] = [beforeFrame];

  // AFTER frame (omit if no finalState — error fixtures).
  let afterFrame: Frame | null = null;
  if (final && typeof final.documentContents === "string") {
    // Final docs ship no marks; re-tokenize identically (no hats on after).
    const afterLines = buildLines(final.documentContents, [], buildOpts);
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

  return { frames, beforeFrame, afterFrame };
}

/** Full pipeline: fixture YAML text → CascadeState (stages 1 → 2 → 3). */
export function fixtureToCascade(
  src: string,
  fixtureRel: string,
  opts: PipelineOptions = {},
): CascadeState {
  const parsed = parseFixture(src, fixtureRel, opts); // 1. get what to render
  const tokenized = tokenizeStates(parsed, opts); //      2. tokenize each step
  return buildRenderObject(parsed, tokenized, opts); //   3. generate render object
}

/** Convenience: load a recorded fixture by relative path. */
export function loadFixtureCascade(
  fixtureRel: string,
  opts: PipelineOptions = {},
): CascadeState {
  const src = readFileSync(`${fixtureRootLazy()}/${fixtureRel}`, "utf8");
  return fixtureToCascade(src, fixtureRel, opts);
}

export { fixtureRootLazy as fixtureRootPath };
