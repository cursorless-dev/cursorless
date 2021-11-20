import { getDelimiterPair } from "./getDelimiterPair";
import {
  PairIndices,
  DelimiterMatch,
  IndividualDelimiter
} from "./types";
import { findOppositeDelimiter } from "./findOppositeDelimiter";

export function findDelimiterPairAdjacentToSelection(
  initialIndex: number,
  delimiterMatches: DelimiterMatch[],
  selectionStartIndex: number,
  selectionEndIndex: number,
  delimiterTextToDelimiterInfoMap: { [k: string]: IndividualDelimiter; }): PairIndices | null {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const match = delimiterMatches[index];

    if (match != null &&
      match.startIndex <= selectionStartIndex &&
      match.endIndex >= selectionEndIndex) {
      const delimiterInfo = delimiterTextToDelimiterInfoMap[match.text];

      if (delimiterInfo != null) {
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
  }

  return null;
}
