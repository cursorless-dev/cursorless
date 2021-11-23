import { findUnmatchedDelimiter } from "./generateUnmatchedDelimiters";
import {
  DelimiterOccurrence,
  IndividualDelimiter,
  PossibleDelimiterOccurrence,
} from "./types";

/**
 * Given a delimiter, scans in the appropriate direction for a matching
 * opposite delimiter.  If we don't know which direction the delimiter is facing
 * (eg for a `"`), we first scan right, then left if nothing is found to the
 * right.  This algorithm will get confused in text files, but keep in mind
 * that for languages with a parse tree, the delimiter occurrence will usually
 * know which direction it is based on where it sits in the parse tree.  That
 * information will be reflected on the `IndividualDelimiter` itself.
 *
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be sorted by offsets
 * @param index The index of the delimiter whose opposite we're looking for
 * @param delimiterInfo The delimiter info for the delimiter occurrence at the
 * given index.  Just passed through for efficiency rather than having to
 * look it up again.  Equivalent to `delimiterOccurrences[index].delimiterInfo`
 * @returns The opposite delimiter, if found; otherwise `null`
 */
export function findOppositeDelimiter(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  index: number,
  delimiterInfo: IndividualDelimiter
): DelimiterOccurrence | null {
  const { side, delimiter } = delimiterInfo;

  switch (side) {
    case "left":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index + 1,
        [delimiter],
        true
      );
    case "right":
      return findUnmatchedDelimiter(
        delimiterOccurrences,
        index - 1,
        [delimiter],
        false
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
