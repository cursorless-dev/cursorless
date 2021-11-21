import { getDelimiterPair } from "./getDelimiterPair";
import {
  PairIndices,
  Offsets,
  PossibleDelimiterOccurrence,
  DelimiterOccurrence,
} from "./types";
import { findOppositeDelimiter } from "./findOppositeDelimiter";

export function findDelimiterPairAdjacentToSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  selectionOffsets: Offsets
): PairIndices | null {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const delimiterOccurrence = delimiterOccurrences[index];

    if (
      delimiterOccurrence != null &&
      delimiterOccurrence.offsets.start <= selectionOffsets.start &&
      delimiterOccurrence.offsets.end >= selectionOffsets.end
    ) {
      const { delimiterInfo } = delimiterOccurrence;

      if (delimiterInfo != null) {
        const possibleMatch = findOppositeDelimiter(
          delimiterOccurrences,
          index,
          delimiterInfo
        );

        if (possibleMatch != null) {
          return getDelimiterPair(
            delimiterOccurrence as DelimiterOccurrence,
            possibleMatch
          );
        }
      }
    }
  }

  return null;
}
