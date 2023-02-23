import { SurroundingPairDirection } from "@cursorless/common";
import { findUnmatchedDelimiter } from "./generateUnmatchedDelimiters";
import {
  DelimiterOccurrence,
  DelimiterSide,
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
  delimiterInfo: IndividualDelimiter,
  forceDirection: "left" | "right" | undefined,
): DelimiterOccurrence | null {
  const { side, delimiter } = delimiterInfo;

  for (const direction of getDirections(side, forceDirection)) {
    const unmatchedDelimiter = findUnmatchedDelimiter(
      delimiterOccurrences,
      direction === "right" ? index + 1 : index - 1,
      [delimiter],
      direction === "right",
    );

    if (unmatchedDelimiter != null) {
      return unmatchedDelimiter;
    }
  }

  return null;
}

function getDirections(
  side: DelimiterSide,
  forceDirection: SurroundingPairDirection | undefined,
): SurroundingPairDirection[] {
  if (forceDirection != null) {
    return [forceDirection];
  }

  switch (side) {
    case "left":
      return ["right"];
    case "right":
      return ["left"];
    case "unknown":
      return ["right", "left"];
  }
}
