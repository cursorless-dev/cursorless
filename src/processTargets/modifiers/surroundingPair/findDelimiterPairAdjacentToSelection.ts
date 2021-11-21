import { getDelimiterPair } from "./getDelimiterPair";
import {
  PairIndices,
  DelimiterOccurrence,
  IndividualDelimiter,
  DelimiterOccurrenceGenerator,
} from "./types";
import { findOppositeDelimiter } from "./findOppositeDelimiter";

export function findDelimiterPairAdjacentToSelection(
  potentiallyAdjacentDelimiters: DelimiterOccurrenceGenerator,
  selectionStartIndex: number,
  selectionEndIndex: number
): PairIndices | null {
  for (const delimiterOccurrence of potentiallyAdjacentDelimiters) {
    if (
      delimiterOccurrence.offsets.start <= selectionStartIndex &&
      delimiterOccurrence.offsets.end >= selectionEndIndex
    ) {
      const possibleMatch = findOppositeDelimiter(
        delimiterMatches,
        index,
        delimiterInfo
      );

      if (possibleMatch != null) {
        return getDelimiterPair(match, possibleMatch);
      }
    }
  }

  return null;
}
