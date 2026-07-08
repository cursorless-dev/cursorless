// Column model — SPEC §2 (resolves D7).
// Converts each line's UTF-16 token stream into an ordered list of VISUAL columns.
// Build-time only; no render-time logic.
//
// - Graphemes per cursorless GRAPHEME_SPLIT_REGEX (SPEC §2.1).
// - Tab → next tabSize stop (SPEC §2.2).
// - East-Asian Wide/Fullwidth glyph = 2 columns (SPEC §2.3).

import type { HatColor, HatShape } from "@cursorless/lib-common";
import { GRAPHEME_SPLIT_REGEX } from "@cursorless/lib-engine";

// Cursorless's grapheme splitter regex, imported from @cursorless/lib-engine
// (no clone): a base letter + its combining marks is ONE grapheme;
// numbers/punct/symbols are each their own grapheme.

export interface InputHat {
  color: HatColor;
  shape: HatShape;
  /** grapheme index within the token; default 0 */
  anchorGrapheme?: number;
}

export interface Token {
  text: string;
  range: { start: number; end: number }; // UTF-16 offsets within the line
  hat?: InputHat | null;
}

export interface Line {
  tokens: Token[];
}

/** One emitted visual column (or multi-column cell for a wide glyph / tab). */
export interface Column {
  /** display text for the cell (a grapheme, or "" for blank tab filler) */
  text: string;
  /** visual column index (first column of this cell) */
  col: number;
  /** number of columns this cell spans (1, 2, or a tab advance) */
  width: number;
  /** UTF-16 char index of this cell's first code unit within the line */
  charIndex: number;
  isAnchor: boolean;
  hatColor?: HatColor;
  hatShape?: HatShape;
}

// East_Asian_Width Wide (W) + Fullwidth (F) ranges. Covers CJK, Hangul,
// fullwidth forms, kana, common emoji presentation. Sufficient for the
// column-model torture test; extend the table if a fixture needs more.
const WIDE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x1100, 0x115f], // Hangul Jamo
  [0x2329, 0x232a], // angle brackets
  [0x2e80, 0x303e], // CJK radicals .. symbols
  [0x3041, 0x33ff], // Hiragana, Katakana, CJK symbols/punct
  [0x3400, 0x4dbf], // CJK Ext A
  [0x4e00, 0x9fff], // CJK Unified
  [0xa000, 0xa4cf], // Yi
  [0xac00, 0xd7a3], // Hangul Syllables
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0xfe10, 0xfe19], // vertical forms
  [0xfe30, 0xfe6f], // CJK compat / small forms
  [0xff00, 0xff60], // Fullwidth Forms
  [0xffe0, 0xffe6], // Fullwidth signs
  [0x1f300, 0x1f64f], // emoji + emoticons
  [0x1f900, 0x1f9ff], // supplemental symbols/pictographs
  [0x20000, 0x3fffd], // CJK Ext B+ (SIP/TIP)
];

function isWideCodePoint(cp: number): boolean {
  for (const [lo, hi] of WIDE_RANGES) {
    if (cp >= lo && cp <= hi) {
      return true;
    }
    if (cp < lo) {
      break;
    }
  }
  return false;
}

/** Display width of a grapheme cluster: 2 if its base code point is EAW W/F, else 1. */
export function graphemeWidth(grapheme: string): number {
  const cp = grapheme.codePointAt(0);
  if (cp === undefined) {
    return 1;
  }
  return isWideCodePoint(cp) ? 2 : 1;
}

interface GraphemeUnit {
  text: string;
  /** char index within the token text */
  offset: number;
}

/** Split a token's text into grapheme clusters, tracking each one's char offset. */
export function splitGraphemes(text: string): GraphemeUnit[] {
  const out: GraphemeUnit[] = [];
  const re = new RegExp(GRAPHEME_SPLIT_REGEX);
  let m: RegExpExecArray | null;
  let lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    // Emit any chars the regex skipped (e.g. whitespace) as single cells so
    // every column of every line is owned by exactly one cell.
    if (m.index > lastIndex) {
      for (let i = lastIndex; i < m.index; i++) {
        out.push({ text: text[i], offset: i });
      }
    }
    out.push({ text: m[0], offset: m.index });
    lastIndex = m.index + m[0].length;
    if (m[0].length === 0) {
      re.lastIndex++;
    } // guard zero-width
  }
  for (let i = lastIndex; i < text.length; i++) {
    out.push({ text: text[i], offset: i });
  }
  return out;
}

/**
 * Expand a line's tokens into ordered visual columns (SPEC §2).
 * Resolves each hat's anchor to a computed visual column (never a raw char index).
 */
export function expandColumns(line: Line, tabSize: number): Column[] {
  const cols: Column[] = [];
  let col = 0;

  for (const token of line.tokens) {
    const graphemes = splitGraphemes(token.text);
    const hat = token.hat ?? undefined;
    const anchorIdx = hat?.anchorGrapheme ?? 0;

    graphemes.forEach((g, gi) => {
      const charIndex = token.range.start + g.offset;
      // Flow-narrowing: `anchorHat` is the token's hat only on the anchor
      // grapheme, else undefined. Deriving it once lets the compiler narrow
      // `anchorHat?.color`/`.shape` without a non-null assertion.
      const anchorHat = gi === anchorIdx ? hat : undefined;
      const isAnchor = anchorHat !== undefined;

      if (g.text === "\t") {
        const advance = tabSize - (col % tabSize) || tabSize;
        cols.push({
          text: "",
          col,
          width: advance,
          charIndex,
          isAnchor,
          hatColor: anchorHat?.color,
          hatShape: anchorHat?.shape,
        });
        col += advance;
        return;
      }

      const w = graphemeWidth(g.text);
      cols.push({
        text: g.text,
        col,
        width: w,
        charIndex,
        isAnchor,
        hatColor: anchorHat?.color,
        hatShape: anchorHat?.shape,
      });
      col += w;
    });
  }

  return cols;
}

/** Total visual columns in a line. */
export function lineWidth(cols: Column[]): number {
  if (cols.length === 0) {
    return 0;
  }
  const last = cols[cols.length - 1];
  return last.col + last.width;
}
