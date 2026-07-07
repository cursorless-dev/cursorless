// REAL hat allocation — cursorless's actual algorithm via the allocate-hats
// sources, INTERNALIZED under ./vendor/allocate-hats (vendored from the
// allocate-hats repo at commit 42452eb, which itself vendors cursorless's
// allocateHats subgraph at SHA 42452eb — proven byte-identical to the shipped
// prose-overlay bundle). Internalized here so the package compiles in-monorepo
// without the unpublished `allocate-hats` npm dependency; the unused QuickJS
// bundle.ts / proseCompat.ts entry points were dropped during vendoring.
//
// Replaces (task-8tq, 2026-07-07):
//   - the greedy per-grapheme color-pool allocator that lived here, and
//   - synthetic-shape.ts (sum-of-code-units % 11) — the repo's one known-fake
//     render element. DECISIONS §7.5 blessing superseded; see §7.5b.
//
// Model:
//   - Every hattable token (single grapheme, per tokenize.ts R5) goes to the
//     real allocator with its document position; ranking is cursorless's own
//     comparator (line delta, then character delta from the cursor).
//   - Fixture marks are passed as OLD ASSIGNMENTS with stability "stable":
//     the algorithm keeps them (its own keep-metric) and their (grapheme,
//     color) pairs are consumed from the pool, so fill tokens can't collide
//     with them — the old step-3b pre-drain, now done by the real thing.
//   - Marks render with shape "default" unless a per-fixture override says
//     otherwise. This is MORE faithful than the synthetic hash: fixture mark
//     keys carry no shape component, meaning the recorded session's hats were
//     default-shape.
//   - Fill tokens take the allocator's style wholesale (color + shape). With
//     the full color x shape style map, shapes appear only under genuine
//     collision pressure (>10 tokens sharing an anchor grapheme) — exactly
//     like a real cursorless session, instead of hash-random shapes.
//
// Determinism: allocate-hats is pure (no Date/random); same lines + marks +
// cursor -> identical assignments. verify-allocation.ts gates this.

import {
  allocateHats as allocateHatsReal,
  StandaloneGraphemeSplitter,
  type HatStyleMap,
} from "./vendor/allocate-hats/index";
import type { Line } from "./columns";
import type { HatColor } from "./data/colors";
import type { HatShape } from "./data/shapes";
import { HAT_COLORS } from "./data/colors";
import { HAT_SHAPES } from "./data/shapes";
import type { Pos } from "./serialize";
import { segmentLines } from "./word-segments";

/** True iff the token text is a single hattable grapheme (letter/number/punct/symbol). */
const SPLITTER = new StandaloneGraphemeSplitter();

// ---------------------------------------------------------------------------
// Style map: our full palette x (default + 10 shapes), penalty-ordered the way
// cursorless orders its own map — default color 0, named colors 1, user colors
// 2, +1 for a shape. Pure colors are inserted BEFORE shaped variants so free
// pure colors win penalty ties in the allocator's candidate ordering (matches
// real cursorless, where shapes appear only after the color pool drains).
// ---------------------------------------------------------------------------

function colorPenalty(color: HatColor): number {
  if (color === "default") {
    return 0;
  }
  return color.startsWith("userColor") ? 2 : 1;
}

export function cssStateHatStyles(): HatStyleMap {
  const out: HatStyleMap = {};
  for (const color of HAT_COLORS) {
    out[color] = { penalty: colorPenalty(color) };
  }
  for (const color of HAT_COLORS) {
    for (const shape of HAT_SHAPES) {
      if (shape === "default") {
        continue;
      } // bare color IS the default shape
      out[`${color}-${shape}`] = { penalty: colorPenalty(color) + 1 };
    }
  }
  return out;
}

/** Split an allocator style name back into our (color, shape) pair. */
function styleToHat(styleName: string): { color: HatColor; shape: HatShape } {
  const dash = styleName.indexOf("-");
  if (dash === -1) {
    return { color: styleName as HatColor, shape: "default" };
  }
  return {
    color: styleName.slice(0, dash) as HatColor,
    shape: styleName.slice(dash + 1) as HatShape,
  };
}

// ---------------------------------------------------------------------------
// Main entry — called by fixture-extract.buildLines after pass 1 has attached
// fixture-mark hats to specific grapheme tokens.
//
// Allocation is per WORD-LEVEL token (word-segments.ts): each segment gets AT
// MOST ONE hat, anchored at the grapheme the real algorithm chooses (its
// returned charIdx). Fixture-marked segments enter as old assignments
// (stability "stable") so the algorithm keeps them and their (grapheme,
// color) pairs drain from the pool; the mark keeps its exact pass-1 grapheme
// position and hat.
// ---------------------------------------------------------------------------

export function allocateHats(
  lines: Line[],
  cursor: Pos = { line: 0, character: 0 },
): void {
  const segments = segmentLines(lines);

  const inputTokens = segments.map((seg) => ({
    text: seg.text,
    position: { line: seg.lineIdx, character: seg.start },
  }));

  const oldAssignments: {
    tokenIdx: number;
    charIdx: number;
    grapheme: string;
    styleName: string;
  }[] = [];
  const pinned = new Set<number>();

  segments.forEach((seg, idx) => {
    for (const g of seg.graphemes) {
      if (!g.hat) {
        continue;
      }
      pinned.add(idx);
      oldAssignments.push({
        tokenIdx: idx,
        charIdx: g.range.start - seg.start,
        grapheme: SPLITTER.normalizeGrapheme(g.text),
        styleName: g.hat.color,
      });
      break; // one mark pins the whole segment
    }
  });

  const assignments = allocateHatsReal({
    tokens: inputTokens,
    oldAssignments,
    stability: "stable",
    enabledHatStyles: cssStateHatStyles(),
    cursorPosition: cursor,
  });

  for (const a of assignments) {
    const seg = segments[a.tokenIdx];
    if (pinned.has(a.tokenIdx)) {
      // Mark keeps its pass-1 hat; tripwire if the algorithm dropped it.
      const marked = seg.graphemes.find((g) => g.hat);
      if (marked && SPLITTER.normalizeGrapheme(marked.text) !== a.grapheme) {
        // Same segment, different anchor grapheme chosen — allowed only if
        // the style survived; color change would break fixture fidelity.
        const kept = styleToHat(a.styleName);
        if (kept.color !== marked.hat!.color) {
          throw new Error(
            `[hat-allocator] real allocator reassigned pinned mark in segment ` +
              `"${seg.text}" (line ${seg.lineIdx}): fixture color ${marked.hat!.color}, ` +
              `allocator gave ${a.styleName}`,
          );
        }
      }
      continue;
    }
    // One hat per word-level token, on the algorithm-chosen grapheme.
    const target = seg.graphemes.find(
      (g) => g.range.start - seg.start === a.charIdx,
    );
    if (target) {
      target.hat = styleToHat(a.styleName);
    }
  }
}
