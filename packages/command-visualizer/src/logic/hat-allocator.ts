// Hat allocation via cursorless's REAL engine (@cursorless/lib-engine), driven
// by an in-memory document — the algorithm is imported directly, not copied in.
//
// The visualizer's render model (columns.ts) is one Token per GRAPHEME with
// line-relative UTF-16 offsets. This module reconstructs the document those
// lines represent, hands it to the real cursorless allocator, and maps the
// returned hats back onto the render tokens.
//
// How it works:
//   1. Reconstruct the document text: each Line's tokens joined, lines joined
//      by "\n".
//   2. Build a FakeIDE + InMemoryTextEditor holding that text, with the cursor
//      as the sole selection (its `active` is the proximity reference point the
//      engine ranks tokens against) and the whole document visible.
//   3. Instantiate the real TokenGraphemeSplitter (cursorless's own grapheme
//      splitter, IDE-configured) and call the real allocateHats(). The engine
//      tokenizes the visible ranges with cursorless's own tokenizer
//      (getTokensInRange), ranks tokens by distance from the cursor, and
//      assigns at most one hat per token.
//   4. Fixture marks — graphemes that already carry a `.hat` from buildLines
//      pass 1 — are PINNED via `forceTokenHats`: for each mark we find the
//      engine token covering its position (getTokensInRange, so token identity
//      matches what the engine produces internally) and force that token's hat
//      to the mark's exact style and grapheme. The engine's chooseTokenHat
//      applies forced hats first, unconditionally, so a pinned mark keeps its
//      fixture color and position.
//   5. Each returned TokenHat is mapped back to the render token at its
//      hatRange (line + character) and gets `.hat = styleToHat(style)`.
//
// The palette / penalty map (cssStateHatStyles + colorPenalty) is the
// visualizer's OWN — the full color x shape space so shapes appear only under
// genuine collision pressure, exactly like a real cursorless session.
//
// Determinism: the engine allocator is pure (no Date/random); the same lines +
// marks + cursor produce identical assignments.

import {
  FakeIDE,
  HatStability,
  type HatStyleMap,
  InMemoryTextEditor,
  Position,
  Range,
  Selection,
  type TokenHat,
} from "@cursorless/lib-common";
import {
  allocateHats as allocateHatsReal,
  getTokensInRange,
  TokenGraphemeSplitter,
} from "@cursorless/lib-engine";
import type { HatColor, HatShape } from "@cursorless/lib-common";
import { HAT_COLORS, HAT_SHAPES } from "@cursorless/lib-common";
import type { Line, Token as RenderToken } from "../model/columns";

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

/** The cssStateHatStyles key for a (color, shape) pair (bare color = default). */
function hatStyleName(color: HatColor, shape: HatShape | undefined): string {
  return shape == null || shape === "default" ? color : `${color}-${shape}`;
}

/** A fixture-marked render token together with its line index. */
interface Mark {
  lineIdx: number;
  token: RenderToken;
  color: HatColor;
  shape: HatShape | undefined;
}

// ---------------------------------------------------------------------------
// Main entry — called by fixture-extract.buildLines after pass 1 has attached
// fixture-mark hats to specific grapheme render tokens. Mutates `lines` in
// place, setting `.hat` on the render token each allocated hat lands on.
// ---------------------------------------------------------------------------

export function allocateHats(
  lines: Line[],
  cursor: Position = new Position(0, 0),
): void {
  // (1) Reconstruct the document text the render model represents.
  const content = lines
    .map((line) => line.tokens.map((t) => t.text).join(""))
    .join("\n");

  // (2) In-memory editor: cursor as the sole selection, whole document visible.
  const ide = new FakeIDE();
  const editor = new InMemoryTextEditor({
    ide,
    languageId: "plaintext",
    content,
    selections: [
      new Selection(
        cursor.line,
        cursor.character,
        cursor.line,
        cursor.character,
      ),
    ],
    // visibleRanges omitted → defaults to the whole document range.
  });

  // (3) Real cursorless grapheme splitter (IDE-configured).
  const tokenGraphemeSplitter = new TokenGraphemeSplitter(ide);

  // (4) Collect fixture marks from the render tokens carrying a pass-1 hat.
  const marks: Mark[] = [];
  lines.forEach((line, lineIdx) => {
    for (const token of line.tokens) {
      if (token.hat) {
        marks.push({
          lineIdx,
          token,
          color: token.hat.color,
          shape: token.hat.shape,
        });
      }
    }
  });

  // Discover the engine tokens once (whole document), so forced-hat token
  // identity matches what the engine produces internally.
  const engineTokens = getTokensInRange(ide, editor, editor.document.range);

  // Build forceTokenHats: for each mark, force the covering engine token to the
  // mark's exact color/shape, anchored on the mark's grapheme.
  const forceTokenHats: TokenHat[] = [];
  const forcedTokenKeys = new Set<string>();
  for (const mark of marks) {
    const markStart = mark.token.range.start; // line-relative char offset
    const covering = engineTokens.find(
      (t) =>
        t.range.start.line === mark.lineIdx &&
        t.range.start.character <= markStart &&
        markStart < t.range.end.character,
    );
    if (covering == null) {
      // Whitespace-only or otherwise untokenized position — nothing to pin.
      continue;
    }
    // One forced hat per engine token (a token wears at most one hat). If two
    // marks fall in the same token, the first wins — matches "one mark pins the
    // whole segment" from the previous word-segment model.
    const tokenKey = `${covering.offsets.start}:${covering.offsets.end}`;
    if (forcedTokenKeys.has(tokenKey)) {
      continue;
    }
    forcedTokenKeys.add(tokenKey);

    const styleName = hatStyleName(mark.color, mark.shape);
    const grapheme = tokenGraphemeSplitter.normalizeGrapheme(mark.token.text);
    // Grapheme range within the document (line-relative positions), matching
    // the render token span so map-back lands on this exact token.
    const hatRange = new Range(
      mark.lineIdx,
      mark.token.range.start,
      mark.lineIdx,
      mark.token.range.end,
    );
    forceTokenHats.push({
      hatStyle: styleName,
      grapheme,
      token: covering,
      hatRange,
    });
  }

  // (5) Run the real allocator.
  const tokenHats = allocateHatsReal({
    ide,
    tokenGraphemeSplitter,
    enabledHatStyles: cssStateHatStyles(),
    forceTokenHats,
    oldTokenHats: [],
    hatStability: HatStability.balanced,
    activeTextEditor: editor,
    visibleTextEditors: [editor],
  });

  // (6) Map each returned hat back onto the render token at its hatRange.
  for (const tokenHat of tokenHats) {
    const { line, character } = tokenHat.hatRange.start;
    const renderLine = lines[line];
    if (renderLine == null) {
      continue;
    }
    const target = renderLine.tokens.find((t) => t.range.start === character);
    if (target == null) {
      continue;
    }
    target.hat = styleToHat(tokenHat.hatStyle);
  }

  ide.exit();
}
