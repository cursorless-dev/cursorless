// Serializer. Pure state JSON → HTML string. No render-time logic.

import type { Theme } from "../data/colors";
import { type Column, type Line, expandColumns, lineWidth } from "../model/columns";
import type { Position, Range } from "@cursorless/lib-common";
import { styleSheet } from "./css";
import { symbolSheet } from "./symbols";
import { esc } from "./html";

export interface EditorState {
  theme: Theme;
  tabSize: number;
  lines: Line[];
  cursors?: Position[];
  selections?: Range[];
}

/** Is a given char index on a given line inside any selection range? */
function inAnySelection(
  lineIdx: number,
  charIndex: number,
  selections: Range[],
): boolean {
  for (const sel of selections) {
    // lib-common Range is always non-reversed (start ≤ end), so no reorder.
    const { start, end } = sel;
    if (lineIdx < start.line || lineIdx > end.line) {
      continue;
    }
    const lo = lineIdx === start.line ? start.character : 0;
    const hi = lineIdx === end.line ? end.character : Infinity;
    if (charIndex >= lo && charIndex < hi) {
      return true;
    }
  }
  return false;
}

/** Map a UTF-16 char index to its visual column on a line (for caret placement). */
function charToCol(cols: Column[], charIndex: number): number {
  for (const c of cols) {
    if (charIndex < c.charIndex) {
      return c.col;
    }
    // last char unit of this cell: account for multi-code-unit graphemes
    if (charIndex === c.charIndex) {
      return c.col;
    }
  }
  return lineWidth(cols);
}

function emitSpan(c: Column, lineIdx: number, selections: Range[]): string {
  const classes = c.isAnchor ? "ch ch--anchor" : "ch";
  const spanAttr =
    c.width === 2
      ? ` data-col-span="2"`
      : c.width > 2
        ? ` data-col-span="${c.width}"`
        : "";
  const selAttr = inAnySelection(lineIdx, c.charIndex, selections)
    ? ' data-sel=""'
    : "";
  const hatAttr = c.isAnchor
    ? ` data-hat="" data-hat-color="${c.hatColor}" data-hat-shape="${c.hatShape}"` +
      ` data-anchor-line="${lineIdx}" data-anchor-col="${c.col}"`
    : "";
  const hat = c.isAnchor
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="hat" aria-hidden="true" viewBox="0 0 12 9"><use href="#hat-${c.hatShape}"/></svg>`
    : "";
  // For blank tab filler emit a single space so the cell has selectable text.
  const text = c.text === "" ? "" : esc(c.text);
  return (
    `<span class="${classes}" data-col="${c.col}"${spanAttr}${selAttr}${hatAttr}>` +
    `${text}${hat}</span>`
  );
}

function emitLine(
  line: Line,
  lineIdx: number,
  state: EditorState,
  lineNumbers: boolean,
): string {
  const cols = expandColumns(line, state.tabSize);
  const selections = state.selections ?? [];
  const cursors = (state.cursors ?? []).filter((c) => c.line === lineIdx);

  // Build a column -> caret-html map so carets render before the column they sit on.
  const caretAtCol = new Map<number, string>();
  for (const cur of cursors) {
    const col = charToCol(cols, cur.character);
    const caret = `<span class="caret" data-cursor="" data-cursor-col="${col}"></span>`;
    caretAtCol.set(col, (caretAtCol.get(col) ?? "") + caret);
  }

  // Optional leading line-number cell (1-based, like a real editor). Only
  // emitted when the gutter is on — keeps the no-gutter output byte-identical.
  const gutter = lineNumbers
    ? `<span class="cl-lineno" aria-hidden="true">${lineIdx + 1}</span>`
    : "";

  let html = "";
  for (const c of cols) {
    if (caretAtCol.has(c.col)) {
      html += caretAtCol.get(c.col);
    }
    html += emitSpan(c, lineIdx, selections);
  }
  // trailing caret (end of line)
  const endCol = lineWidth(cols);
  if (caretAtCol.has(endCol)) {
    html += caretAtCol.get(endCol);
  }

  return `    <div class="cl-line" data-line="${lineIdx}">${gutter}${html}</div>`;
}

/** Render options for the single-editor serializer. */
export interface EditorRenderOptions {
  /** Emit the left line-number gutter. OFF by default. */
  lineNumbers?: boolean;
}

/** Widest line number → digit count for the gutter width. */
function gutterDigits(state: EditorState): number {
  return String(Math.max(1, state.lines.length)).length;
}

/** Serialize state to the inner editor markup (defs + lines). */
export function serializeEditor(
  state: EditorState,
  opts: EditorRenderOptions = {},
): string {
  const lineNumbers = opts.lineNumbers ?? false;
  const lines = state.lines
    .map((line, i) => emitLine(line, i, state, lineNumbers))
    .join("\n");
  // Only when ON do we add the gutter attribute + digit-width var. OFF →
  // neither appears, so the markup is byte-identical to before.
  const gutterAttr = lineNumbers ? ` data-line-numbers=""` : "";
  // Leading "; " keeps the OFF path's style attribute byte-identical (no
  // trailing separator appears unless the gutter var is actually emitted).
  const gutterVar = lineNumbers
    ? `; --gutter-digits:${gutterDigits(state)}`
    : "";
  return (
    `<div class="cl-editor" data-theme="${state.theme}"${gutterAttr} style="--tab-size:${state.tabSize}${gutterVar}">\n` +
    `${symbolSheet()}\n` +
    `  <div class="cl-code">\n${lines}\n  </div>\n` +
    `</div>`
  );
}

/** Serialize state to a full standalone HTML document (with the stylesheet inlined). */
export function serializeDocument(
  state: EditorState,
  title = "cursorless state",
  opts: EditorRenderOptions = {},
): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
html, body { margin: 0; background: ${state.theme === "dark" ? "#141414" : "#e8e8e8"}; }
body { padding: 24px; }
${styleSheet()}
</style>
</head>
<body>
${serializeEditor(state, opts)}
</body>
</html>`;
}
