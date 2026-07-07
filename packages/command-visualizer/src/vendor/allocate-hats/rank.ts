/**
 * Port of `rankPreTokenizedInput` from cursorless
 * packages/cursorless-engine/src/util/allocateHats/getRankedTokens.ts at SHA
 * 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe, with the fake-editor plumbing
 * removed: the reference cursor position is a plain argument instead of
 * `activeTextEditor.selections[0].active`. The display-line map construction,
 * the comparator (vendored getTokenComparator), and the rank = -sortedIndex
 * convention are unchanged.
 */

import { Position, type RankedToken, type Token } from "./common";
import { getTokenComparator } from "./vendor/getTokenComparator";

export function rankTokensByProximity(
  tokens: readonly Token[],
  referencePosition: Position,
): RankedToken[] {
  if (tokens.length === 0) {
    return [];
  }

  // Build a stable display-line map directly from the supplied tokens so the
  // comparator sees a consistent ordering even without an editor walk.
  const lines = new Set<number>([referencePosition.line]);
  for (const token of tokens) {
    lines.add(token.range.start.line);
  }
  const sortedLines = [...lines].sort((a, b) => a - b);
  const displayLineMap = new Map<number, number>(
    sortedLines.map((line, index) => [line, index]),
  );

  const withDisplayLine = tokens.map((token) => ({
    ...token,
    displayLine: displayLineMap.get(token.range.start.line)!,
  }));

  withDisplayLine.sort(
    getTokenComparator(
      displayLineMap.get(referencePosition.line)!,
      referencePosition.character,
    ),
  );

  return withDisplayLine.map((token, index) => ({ token, rank: -index }));
}
