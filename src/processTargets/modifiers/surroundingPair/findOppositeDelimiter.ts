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
  const { side, opposite } = delimiterInfo;

  switch (side) {
    case "right":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index - 1,
        [opposite],
        false
      );
    case "left":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index + 1,
        [opposite],
        true
      );
    case "unknown":
      return (
        findUnmatchedDelimiter(
          delimiterOccurrences,
          index + 1,
          [opposite],
          true
        ) ??
        findUnmatchedDelimiter(
          delimiterOccurrences,
          index - 1,
          [opposite],
          false
        )
      );
  }
}
