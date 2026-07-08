// Overlay resolution. Maps a frame's decorations + selection onto the COLUMN
// grid (column mapping, not raw char index), resolving single-winner precedence
// per cell (selection < highlight < flash, last wins). Also resolves full-width
// line-range bands.

import { type Column, expandColumns } from "./columns";
import type { Decoration, Frame, OverlayRole } from "./frame-state";
import type { OverlayStyleName } from "../data/decorations";
import { overlayPrecedence } from "../data/decorations";
import { type Range, isLineRange } from "@cursorless/lib-common";

// Role sub-rank, used to break style-precedence ties: a REAL ide.flash outranks
// a DERIVED that/source overlay on the
// same range, so e.g. justAdded (flash) wins over a thatMark→referenced on the
// inserted text. selection < highlight < {derived that/source} < flash.
function roleRank(role: OverlayRole | "selection"): number {
  if (role === "selection") {
    return 0;
  }
  if (role === "flash") {
    return 3;
  }
  if (role === "highlight") {
    return 1;
  }
  return 2; // that | source | scope:* (derived)
}

export interface CellOverlay {
  /** the single winning background style for this cell (or null) */
  winner: OverlayStyleName | "selection" | null;
  /** all overlays present (for data-flash-stack test visibility) */
  stack: (OverlayStyleName | "selection")[];
}

export interface LineOverlay {
  /** per visual column -> overlay (indexed by Column.col start) */
  byCol: Map<number, CellOverlay>;
  /** full-width line-range band style, if this line is in any line decoration */
  lineFlash: OverlayStyleName | null;
}

/** Columns covered by a half-open character range on a given line. */
function colsForCharRange(
  cols: Column[],
  lineIdx: number,
  firstLine: number,
  startCh: number,
  lastLine: number,
  endCh: number,
): number[] {
  if (lineIdx < firstLine || lineIdx > lastLine) {
    return [];
  }
  const loCh = lineIdx === firstLine ? startCh : 0;
  const hiCh = lineIdx === lastLine ? endCh : Infinity;
  const out: number[] = [];
  for (const c of cols) {
    // a cell starts at charIndex; treat it as covering [charIndex, nextCharIndex)
    if (c.charIndex >= loCh && c.charIndex < hiCh) {
      out.push(c.col);
    }
  }
  return out;
}

/** Resolve all overlays for one line of a frame. */
function resolveLine(
  cols: Column[],
  lineIdx: number,
  selections: Range[],
  decorations: Decoration[],
): LineOverlay {
  const byCol = new Map<number, CellOverlay>();
  // track the winning (stylePrec, roleRank) tuple per column
  const winRank = new Map<number, number>();

  const add = (
    col: number,
    style: OverlayStyleName | "selection",
    role: OverlayRole | "selection",
  ) => {
    let cell = byCol.get(col);
    if (!cell) {
      cell = { winner: null, stack: [] };
      byCol.set(col, cell);
    }
    cell.stack.push(style);
    // lexicographic rank: style precedence dominates, role breaks ties.
    const rank = overlayPrecedence(style) * 10 + roleRank(role);
    const prev = winRank.get(col);
    if (prev === undefined || rank >= prev) {
      cell.winner = style; // last-wins at equal rank
      winRank.set(col, rank);
    }
  };

  // selection (precedence 0)
  for (const sel of selections) {
    const a = sel.start;
    const b = sel.end;
    for (const col of colsForCharRange(
      cols,
      lineIdx,
      a.line,
      a.character,
      b.line,
      b.character,
    )) {
      add(col, "selection", "selection");
    }
  }

  // character-range decorations (highlight prec 1, flash prec 2)
  let lineFlash: OverlayStyleName | null = null;
  for (const dec of decorations) {
    if (isLineRange(dec.range)) {
      if (lineIdx >= dec.range.start && lineIdx <= dec.range.end) {
        lineFlash = dec.style; // last line decoration wins
      }
      continue;
    }
    const r = dec.range;
    for (const col of colsForCharRange(
      cols,
      lineIdx,
      r.start.line,
      r.start.character,
      r.end.line,
      r.end.character,
    )) {
      add(col, dec.style, dec.role);
    }
  }

  return { byCol, lineFlash };
}

/** Resolve overlays for every line of a frame. Returns a per-line array. */
export function resolveFrameOverlays(
  frame: Frame,
  tabSize: number,
): LineOverlay[] {
  return frame.lines.map((line, i) =>
    resolveLine(
      expandColumns(line, tabSize),
      i,
      frame.selections,
      frame.decorations,
    ),
  );
}
