import { findUnmatchedDelimiter } from "./generateUnmatchedDelimiters";
import { DelimiterOccurrence, IndividualDelimiter } from "./types";


export function findOppositeDelimiter(
  delimiterMatches: DelimiterOccurrence[],
  index: number,
  delimiterInfo: IndividualDelimiter
): DelimiterOccurrence | null {
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
