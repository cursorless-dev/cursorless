// Shared pipeline types — the contract between the three named stages
// (parseFixture → tokenizeStates → buildRenderObject). Kept in its own module
// so stage files can import them without a circular pipeline ⇄ build-render
// edge. logic/ → logic/ + model/ + data/ imports only.

import type { HatColor, HatShape } from "@cursorless/lib-common";
import type { Theme } from "../data/colors";
import type { Frame } from "../model/types";
import type { Obj } from "./fixture-extract";

export interface PipelineOptions {
  shapeOverride?: Record<string, HatShape>;
  theme?: Theme;
  tabSize?: number;
  /** "dense" (default) = real-allocator fill everywhere; "marks-only" = exactly the recorded marks. */
  fill?: "dense" | "marks-only";
  /** Position-keyed exact-hat overrides, keyed "{line}:{startChar}" — applied last, wins over everything. */
  hatOverride?: Record<string, { color?: HatColor; shape?: HatShape }>;
}

/** Stage-1 output: the parsed fixture plus everything stages 2/3 read from it. */
export interface ParsedFixture {
  theme: Theme;
  tabSize: number;
  meta: { spokenForm?: string; action?: string; fixture: string };
  initial: Obj | null;
  final: Obj | null;
  ide: Obj | null;
  /** clipboard visible on a given state, per action semantics. */
  clipFor: (state: "before" | "after") => string | undefined;
}

/** Stage-2 output: the tokenized before/after frames (mutated by stage 3). */
export interface TokenizedStates {
  frames: Frame[];
  beforeFrame: Frame;
  afterFrame: Frame | null;
}
