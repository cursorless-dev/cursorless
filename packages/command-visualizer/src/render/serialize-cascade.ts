// Cascade serializer. Pure CascadeState → HTML. Zero render-time JS.
// Emits N stacked `.frame` surfaces in one `.cl-cascade`, the symbol sheet ONCE,
// per-frame `@keyframes f{k}` opacity timeline, and the decoration overlay layer
// (data-flash / data-hl / data-line-flash) resolved single-winner per cell.

import { type Column, expandColumns, lineWidth } from "../model/columns";
import { styleSheet } from "./css";
import { cascadeStyleSheet, cascadeThemeBridge } from "./css-cascade";
import { jumbotronCss, serializeJumbotron } from "./jumbotron";
import type { CellOverlay } from "../model/overlays";
import { symbolSheet } from "./symbols";
import type { CascadeState, Frame } from "../model/types";
import { resolveFrameOverlays, type LineOverlay } from "../model/overlays";
import { HIGHLIGHT_STYLES, MS_PER_STATE } from "../data/decorations";
import { timelineOf } from "../model/timeline";
import { captionHtml, esc, themeBackground } from "./html";

function charToCol(cols: Column[], charIndex: number): number {
  for (const c of cols) {
    if (charIndex <= c.charIndex) {
      return c.col;
    }
  }
  return lineWidth(cols);
}

function overlayAttr(winner: string | null): string {
  if (!winner) {
    return "";
  }
  if (winner === "selection") {
    return ' data-sel=""';
  }
  if ((HIGHLIGHT_STYLES as string[]).includes(winner)) {
    return ` data-hl="${winner}"`;
  }
  return ` data-flash="${winner}"`;
}

function emitSpan(c: Column, cell: CellOverlay | undefined): string {
  const classes = c.isAnchor ? "ch ch--anchor" : "ch";
  const spanAttr =
    c.width === 2
      ? ` data-col-span="2"`
      : c.width > 2
        ? ` data-col-span="${c.width}"`
        : "";
  const winner = cell?.winner ?? null;
  const ovAttr = overlayAttr(winner);
  const stackAttr =
    cell && cell.stack.length > 1
      ? ` data-flash-stack="${cell.stack.join(",")}"`
      : "";
  const hatAttr = c.isAnchor
    ? ` data-hat="" data-hat-color="${c.hatColor}" data-hat-shape="${c.hatShape}"` +
      ` data-anchor-col="${c.col}"`
    : "";
  const hat = c.isAnchor
    ? `<svg xmlns="http://www.w3.org/2000/svg" class="hat" aria-hidden="true" viewBox="0 0 12 9"><use href="#hat-${c.hatShape}"/></svg>`
    : "";
  const text = c.text === "" ? "" : esc(c.text);
  return (
    `<span class="${classes}" data-col="${c.col}"${spanAttr}${ovAttr}${stackAttr}${hatAttr}>` +
    `${text}${hat}</span>`
  );
}

function emitLine(
  frame: Frame,
  lineIdx: number,
  tabSize: number,
  overlay: LineOverlay,
  lineNumbers: boolean,
): string {
  const cols = expandColumns(frame.lines[lineIdx], tabSize);
  const cursors = frame.cursors.filter((c) => c.line === lineIdx);

  const caretAtCol = new Map<number, string>();
  for (const cur of cursors) {
    const col = charToCol(cols, cur.character);
    caretAtCol.set(
      col,
      (caretAtCol.get(col) ?? "") +
        `<span class="caret" data-cursor="" data-cursor-col="${col}"></span>`,
    );
  }

  // Optional leading line-number cell (1-based, like a real editor). Only
  // emitted when the gutter is on — keeps the no-gutter output byte-identical.
  const gutter = lineNumbers
    ? `<span class="cl-lineno" aria-hidden="true">${lineIdx + 1}</span>`
    : "";

  let inner = "";
  for (const c of cols) {
    if (caretAtCol.has(c.col)) {
      inner += caretAtCol.get(c.col);
    }
    inner += emitSpan(c, overlay.byCol.get(c.col));
  }
  const endCol = lineWidth(cols);
  if (caretAtCol.has(endCol)) {
    inner += caretAtCol.get(endCol);
  }

  const lineFlashAttr = overlay.lineFlash
    ? ` data-line-flash="${overlay.lineFlash}"`
    : "";
  // NO leading whitespace and NO newline joins around cl-line: this markup
  // lives inside .cl-code (white-space: pre), where inter-element whitespace
  // renders as phantom blank lines (latent flaw exposed by the fixed-height
  // SVG viewport).
  return `<div class="cl-line" data-line="${lineIdx}"${lineFlashAttr}>${gutter}${inner}</div>`;
}

function emitFrame(
  frame: Frame,
  frameIdx: number,
  tabSize: number,
  lineNumbers: boolean,
): string {
  const overlays = resolveFrameOverlays(frame, tabSize);
  const lines = frame.lines
    .map((_, i) => emitLine(frame, i, tabSize, overlays[i], lineNumbers))
    .join("");
  return (
    `  <div class="frame" data-frame="${frameIdx}" data-role="${frame.role}" style="animation-name: f${frameIdx}">\n` +
    `    <div class="cl-code">${lines}</div>\n` +
    `  </div>`
  );
}

/** Render options for the cascade serializer. */
export interface CascadeRenderOptions {
  /** Emit the left line-number gutter. OFF by default. */
  lineNumbers?: boolean;
}

/** Widest line number across all frames → digit count for the gutter width. */
function gutterDigits(state: CascadeState): number {
  const maxLines = Math.max(1, ...state.frames.map((f) => f.lines.length));
  return String(maxLines).length;
}

/** Serialize a CascadeState to the inner cascade markup. */
export function serializeCascade(
  state: CascadeState,
  opts: CascadeRenderOptions = {},
): string {
  const lineNumbers = opts.lineNumbers ?? false;
  const n = state.frames.length;
  const tl = timelineOf(state.frames);
  const frames = state.frames
    .map((f, i) => emitFrame(f, i, state.tabSize, lineNumbers))
    .join("\n");
  const metaAttr = state.meta?.fixture
    ? ` data-fixture="${esc(state.meta.fixture)}"`
    : "";
  const spokenAttr = state.meta?.spokenForm
    ? ` data-spoken-form="${esc(state.meta.spokenForm)}"`
    : "";
  // Only when ON do we add the gutter attribute + digit-width var. OFF →
  // neither appears, so the markup/CSS hook is byte-identical to before.
  const gutterAttr = lineNumbers ? ` data-line-numbers=""` : "";
  const gutterVar = lineNumbers
    ? ` --gutter-digits:${gutterDigits(state)};`
    : "";
  return (
    `<div class="cl-cascade" data-theme="${state.theme}" data-frame-count="${n}"${metaAttr}${spokenAttr}${gutterAttr}` +
    ` data-total-ms="${tl.totalMs}" data-frame-starts="${tl.startMs.join(",")}"` +
    ` style="--tab-size:${state.tabSize}; --frames:${n}; --dur:${Math.max(MS_PER_STATE, tl.totalMs)}ms;${gutterVar}">\n` +
    `${symbolSheet()}\n` +
    `${frames}\n` +
    `</div>`
  );
}

/** Full standalone HTML document for a cascade. */
export function serializeCascadeDocument(
  state: CascadeState,
  title = "cursorless cascade",
  opts: CascadeRenderOptions = {},
): string {
  const bg = themeBackground(state.theme);
  const caption = captionHtml(state.meta);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
html, body { margin: 0; background: ${bg}; }
body { padding: 24px; font-family: ui-monospace, monospace; }
.cl-caption { color: #888; font-size: 12px; margin-bottom: 10px; }
${styleSheet()}
${cascadeThemeBridge()}
${cascadeStyleSheet(state.frames)}
${jumbotronCss(state)}
</style>
</head>
<body>
${caption}
${serializeJumbotron(state, serializeCascade(state, opts))}
</body>
</html>`;
}
