import { findUnmatchedDelimiter } from "./generateUnmatchedDelimiters";
import {
  DelimiterOccurrence,
  IndividualDelimiter,
  PossibleDelimiterOccurrence,
} from "./types";

export function findOppositeDelimiter(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  index: number,
  delimiterInfo: IndividualDelimiter
): DelimiterOccurrence | null {
  const { side, delimiter } = delimiterInfo;

  switch (side) {
    case "right":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index - 1,
        [delimiter],
        false
      );
    case "left":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index + 1,
        [delimiter],
        true
      );
    case "unknown":
      return (
        findUnmatchedDelimiter(
          delimiterOccurrences,
          index + 1,
          [delimiter],
          true
        ) ??
        findUnmatchedDelimiter(
          delimiterOccurrences,
          index - 1,
          [delimiter],
          false
        )
      );
  }
}
