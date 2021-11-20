import { findUnmatchedDelimiter } from "./generateUnmatchedDelimiters";
import { DelimiterMatch, IndividualDelimiter } from "./types";


export function findOppositeDelimiter(
  delimiterMatches: DelimiterMatch[],
  index: number,
  delimiterInfo: IndividualDelimiter
): DelimiterMatch | null {
  const { direction, opposite } = delimiterInfo;

  switch (direction) {
    case "left":
      return findUnmatchedDelimiter(
        delimiterMatches,
        index - 1,
        [opposite],
        false
      );
    case "right":
      return findUnmatchedDelimiter(
        delimiterMatches,
        index + 1,
        [opposite],
        true
      );
    case "bidirectional":
      return (
        findUnmatchedDelimiter(delimiterMatches, index + 1, [opposite], true) ??
        findUnmatchedDelimiter(delimiterMatches, index - 1, [opposite], false)
      );
  }
}
