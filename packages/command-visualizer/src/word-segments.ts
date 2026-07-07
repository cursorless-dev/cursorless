// Word-level token segmentation over the per-grapheme render tokens.
//
// The render model is one Token per GRAPHEME (tokenize.ts R5 — column math
// needs it). But cursorless ALLOCATES per word-level token: "value" is one
// token wearing ONE hat, not five (task-mim correction, 2026-07-07 — the R5
// "dense hatting = every grapheme" reading was wrong; upstream hats every
// TOKEN, anchored at one grapheme).
//
// Segmentation approximates cursorless's default tokenizer: maximal runs of
// word characters (letters / marks / digits / underscore) form one segment;
// every other non-whitespace grapheme is its own single-grapheme segment.

import type { Line, Token } from "./columns";

const WORD_CHAR = /^[\p{L}\p{M}\p{N}_]+$/u;

export interface WordSegment {
  /** Grapheme render-tokens composing this word-level token, in order. */
  graphemes: Token[];
  /** Concatenated text of the segment. */
  text: string;
  /** Line-relative start offset (== graphemes[0].range.start). */
  start: number;
  lineIdx: number;
}

/** True for tokens that can carry a hat at all (non-whitespace grapheme). */
export function isHattableGrapheme(token: Token): boolean {
  return token.text.trim().length > 0;
}

/**
 * Group a line's grapheme tokens into word-level segments. Consecutive
 * word-character graphemes with ADJACENT ranges merge; everything else
 * (punctuation, symbols) stands alone.
 */
export function segmentLine(line: Line, lineIdx: number): WordSegment[] {
  const segments: WordSegment[] = [];
  let current: WordSegment | null = null;

  for (const token of line.tokens) {
    if (!isHattableGrapheme(token)) {
      current = null;
      continue;
    }
    const isWord = WORD_CHAR.test(token.text);
    const adjacent =
      current != null &&
      current.graphemes[current.graphemes.length - 1].range.end ===
        token.range.start;

    if (isWord && current != null && adjacent) {
      current.graphemes.push(token);
      current.text += token.text;
      continue;
    }

    const seg: WordSegment = {
      graphemes: [token],
      text: token.text,
      start: token.range.start,
      lineIdx,
    };
    segments.push(seg);
    current = isWord ? seg : null;
  }

  return segments;
}

export function segmentLines(lines: Line[]): WordSegment[] {
  return lines.flatMap((line, i) => segmentLine(line, i));
}
