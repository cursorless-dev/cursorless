// Geometry primitives — shared position/range model. Pure, no HTML, no logic.
// Extracted from serialize.ts so both `logic/` and `render/` can depend on these
// without either scope importing the other (see ARCHITECTURE.md).

export interface Pos {
  line: number;
  character: number; // UTF-16 char index within the line
}

export interface Range {
  start: Pos;
  end: Pos;
}

/** Normalize a range so `start` precedes `end` in document order. */
export function orderRange(r: Range): Range {
  const a = r.start;
  const b = r.end;
  if (a.line < b.line || (a.line === b.line && a.character <= b.character)) {
    return r;
  }
  return { start: b, end: a };
}
