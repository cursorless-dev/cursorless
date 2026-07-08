// Field-extraction helpers for the fixture → state pipeline (SPEC-v2 §2 steps
// 3/4/5). Pulls the YAML-shape coercion + marks→hats + selections + range
// mapping out of pipeline.ts so each module stays under the line ceiling.

import type { YamlValue } from "./fixture-yaml";
import { tokenizeDoc } from "./tokenize";
import type { HatColor, HatShape } from "@cursorless/lib-common";
import { HAT_COLORS } from "@cursorless/lib-common";
import type { Line, Token, InputHat } from "./columns";
import type { GeneralizedRange } from "./frame-state";
import type { Pos, Range } from "./serialize";
import { allocateHats } from "./hat-allocator";

export type Obj = Record<string, YamlValue>;

export function asObj(v: YamlValue | undefined): Obj | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : null;
}
export function asArr(v: YamlValue | undefined): YamlValue[] {
  return Array.isArray(v) ? v : [];
}
export function num(v: YamlValue | undefined): number {
  return typeof v === "number" ? v : Number(v);
}
export function pos(v: YamlValue | undefined): Pos {
  const o = asObj(v) ?? {};
  return { line: num(o.line), character: num(o.character) };
}

// Dedup note (re-verified against current signatures): @cursorless/lib-common
// exports serializedMarksToTokenHats(marks, editor), but its signature
// hard-requires a live TextEditor — it calls editor.document.offsetAt(range)
// and editor.document.getText(range) — and returns engine TokenHat[]
// (token.editor/offsets/hatRange). Our parseMarks reads plain fixture-YAML
// `{color}.{grapheme}` objects with NO editor and yields the MarkInfo render
// model buildLines() needs. buildLines() itself (tokenize → attach fixture hats
// → real allocator fill → author overrides) is genuinely ours. Adopting the
// engine helper would mean synthesizing a fake TextEditor and rewriting
// buildLines — scope balloon for no gain. Kept.

// Step 4: a `{color}.{grapheme}` mark with its line range.
export interface MarkInfo {
  key: string;
  grapheme: string;
  color: HatColor;
  start: Pos;
  end: Pos;
}

export function parseMarks(marksObj: Obj | null): MarkInfo[] {
  if (!marksObj) {
    return [];
  }
  const out: MarkInfo[] = [];
  for (const [key, val] of Object.entries(marksObj)) {
    const range = asObj(val);
    if (!range) {
      continue;
    }
    const dot = key.indexOf(".");
    if (dot === -1) {
      continue; // mark key must be "{color}.{grapheme}" — skip malformed entries
    }
    const colorRaw = key.slice(0, dot);
    const grapheme = key.slice(dot + 1);
    const color = (HAT_COLORS as readonly string[]).includes(colorRaw)
      ? (colorRaw as HatColor)
      : ("default" as HatColor);
    out.push({
      key,
      grapheme,
      color,
      start: pos(range.start),
      end: pos(range.end),
    });
  }
  return out;
}

/** Options for buildLines beyond the mark list. */
export interface BuildLinesOptions {
  /** Per-mark-key shape overrides, e.g. { "default.f": "fox" }. */
  shapeOverride?: Record<string, HatShape>;
  /**
   * "dense" (default): real-allocator fill over every unhatted hattable
   * token — the whole image wears hats, like a live session.
   * "marks-only": render exactly the fixture's recorded marks, no fill.
   */
  fill?: "dense" | "marks-only";
  /**
   * Position-keyed exact-hat overrides applied LAST, to any token (marked or
   * fill), keyed "{line}:{startChar}". Author intent wins over both the
   * fixture and the allocator; may deliberately duplicate a (grapheme, style)
   * the allocator assigned elsewhere — that's on the author.
   */
  hatOverride?: Record<string, { color?: HatColor; shape?: HatShape }>;
}

// Steps 3 + 4 + 5: tokenize a doc and attach hats.
export function buildLines(
  doc: string,
  marks: MarkInfo[],
  opts: BuildLinesOptions = {},
): Line[] {
  const { shapeOverride, fill = "dense", hatOverride } = opts;
  const lines = tokenizeDoc(doc);

  // Pass 1: command-relevant fixture marks — exact fixture color; shape is
  // "default" unless a per-fixture override says otherwise. Fixture mark keys
  // ({color}.{grapheme}) carry no shape component: the recorded session's
  // hats were default-shape, so "default" is the faithful rendering (the old
  // synthetic hash injected fake shapes here — removed in task-8tq).
  for (const mk of marks) {
    if (mk.start.line !== mk.end.line) {
      continue;
    } // marks are single-line in corpus
    const line = lines[mk.start.line];
    if (!line) {
      continue;
    }
    const hat: InputHat = {
      color: mk.color,
      shape: shapeOverride?.[mk.key] ?? "default",
    };
    let target: Token | undefined = line.tokens.find(
      (t) =>
        t.range.start === mk.start.character &&
        t.range.end === mk.end.character,
    );
    if (!target) {
      target = line.tokens.find(
        (t) =>
          t.range.start <= mk.start.character &&
          mk.start.character < t.range.end,
      );
    }
    if (target) {
      target.hat = hat;
    }
  }

  // Pass 2: REAL hat allocation (allocate-hats package — cursorless's own
  // chooseTokenHat at SHA 42452eb). Fixture-marked tokens from pass 1 enter
  // as old assignments (kept, and their colors consumed from the pool); every
  // other hattable token gets the algorithm's color AND shape — shapes now
  // appear only under real collision pressure instead of hash randomness.
  // Skipped in "marks-only" mode: render exactly what the fixture recorded.
  if (fill === "dense") {
    allocateHats(lines);
  }

  // Pass 3: position-keyed exact-hat overrides — author intent wins last.
  if (hatOverride) {
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      for (const token of lines[lineIdx].tokens) {
        const o = hatOverride[`${lineIdx}:${token.range.start}`];
        if (!o) {
          continue;
        }
        token.hat = {
          color: o.color ?? token.hat?.color ?? "default",
          shape: o.shape ?? token.hat?.shape ?? "default",
        };
      }
    }
  }

  return lines;
}

// Selections → {cursors, selections}. anchor==active ⇒ caret; reversed normalize.
export function deriveSelections(selArr: YamlValue[]): {
  cursors: Pos[];
  selections: Range[];
} {
  const cursors: Pos[] = [];
  const selections: Range[] = [];
  for (const s of selArr) {
    const o = asObj(s);
    if (!o) {
      continue;
    }
    const anchor = pos(o.anchor);
    const active = pos(o.active);
    if (anchor.line === active.line && anchor.character === active.character) {
      cursors.push(anchor);
    } else {
      const before =
        anchor.line < active.line ||
        (anchor.line === active.line && anchor.character <= active.character);
      selections.push(
        before
          ? { start: anchor, end: active }
          : { start: active, end: anchor },
      );
    }
  }
  return { cursors, selections };
}

// Steps 6/7: a flash/highlight range YAML → a Decoration GeneralizedRange.
export function toGeneralizedRange(rangeObj: Obj): GeneralizedRange | null {
  if (rangeObj.type === "line") {
    return {
      type: "line",
      startLine: num(rangeObj.start),
      endLine: num(rangeObj.end), // INCLUSIVE per GeneralizedRange.ts
    };
  }
  return {
    type: "character",
    start: pos(rangeObj.start),
    end: pos(rangeObj.end),
  };
}
