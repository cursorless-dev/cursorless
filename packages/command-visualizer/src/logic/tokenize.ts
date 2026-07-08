// Grapheme tokenizer + inverse detokenizer.
//
// Fixtures ship RAW `documentContents`, not tokens, and every column must be
// owned by exactly one token. Grapheme-level hatting splits each line into ONE
// TOKEN PER GRAPHEME — letters AND each individual symbol / operator / paren
// (`=>`, `(`, `)`, `:`, `;`, `"`, …) — exactly like real cursorless
// (GRAPHEME_SPLIT_REGEX, tokenGraphemeSplitter.ts). Whitespace runs between
// graphemes become their own (non-hattable) tokens. Each token carries its
// UTF-16 line offsets, so the grapheme/column math runs unchanged.
//
// Because each non-whitespace token is now a single grapheme, fixture-extract
// can attach a hat to EVERY grapheme (one hat per token, anchored at the
// token's first — and only — grapheme), matching cursorless's dense hatting.
//
// GATE 0: detokenize(tokenize(doc)) === doc BYTE-FOR-BYTE.
// Detokenize concatenates token text in order; since the union of grapheme +
// whitespace tokens partitions the line with no gaps or overlaps, the roundtrip
// stays byte-exact. The roundtrip test (src/verify-roundtrip-doc.ts) proves it.

import { GRAPHEME_SPLIT_REGEX } from "@cursorless/lib-engine";
import type { Line, Token } from "../model/columns";

// Cursorless grapheme splitter: a base letter + its combining marks is ONE
// grapheme; each number / punctuation / symbol is its own grapheme. The regex
// is imported from @cursorless/lib-engine (GRAPHEME_SPLIT_REGEX) — no clone.

/**
 * Tokenize one line's text into per-grapheme tokens (plus whitespace tokens).
 * `\n` is NEVER part of a line (the doc is pre-split on `\n`).
 * Every UTF-16 offset of the line belongs to exactly one token.
 *
 * Any code unit the grapheme regex does not match (whitespace, control chars,
 * lone surrogates) is emitted as its own single-code-unit token so the line is
 * fully partitioned and detokenize is byte-exact.
 */
export function tokenizeLine(text: string): Token[] {
  const tokens: Token[] = [];
  // Fresh RegExp per call: GRAPHEME_SPLIT_REGEX is a shared /gu instance whose
  // lastIndex must not leak across tokenizeLine calls.
  const re = new RegExp(GRAPHEME_SPLIT_REGEX);
  let m: RegExpExecArray | null;
  let last = 0;

  const emitGapAsTokens = (from: number, to: number) => {
    // Coalesce a run of unmatched code units into whitespace/other tokens.
    // Whitespace is grouped into a single run (never hattable); any non-ws gap
    // char is emitted as its own token. In practice gaps are whitespace.
    let i = from;
    while (i < to) {
      if (/\s/.test(text[i])) {
        let j = i;
        while (j < to && /\s/.test(text[j])) {
          j++;
        }
        tokens.push({ text: text.slice(i, j), range: { start: i, end: j } });
        i = j;
      } else {
        tokens.push({ text: text[i], range: { start: i, end: i + 1 } });
        i++;
      }
    }
  };

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      emitGapAsTokens(last, m.index);
    }
    tokens.push({
      text: m[0],
      range: { start: m.index, end: m.index + m[0].length },
    });
    last = m.index + m[0].length;
    if (m[0].length === 0) {
      re.lastIndex++;
    } // guard zero-width
  }
  if (last < text.length) {
    emitGapAsTokens(last, text.length);
  }
  return tokens;
}

/** Tokenize a whole document into Line[]. Splits on `\n`. */
export function tokenizeDoc(doc: string): Line[] {
  const rawLines = doc.split("\n");
  return rawLines.map((text) => ({ tokens: tokenizeLine(text) }));
}

/** Inverse: concatenate a line's token text back to the original line string. */
export function detokenizeLine(line: Line): string {
  return line.tokens.map((t) => t.text).join("");
}

/** Inverse of tokenizeDoc: rejoin lines with `\n`. Must be byte-exact. */
export function detokenizeDoc(lines: Line[]): string {
  return lines.map(detokenizeLine).join("\n");
}
