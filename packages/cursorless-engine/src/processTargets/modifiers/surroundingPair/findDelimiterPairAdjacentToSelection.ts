import type { SurroundingPairScopeType } from "@cursorless/common";
import { findOppositeDelimiter } from "./findOppositeDelimiter";
import { getSurroundingPairOffsets } from "./getSurroundingPairOffsets";
import type {
  DelimiterOccurrence,
  Offsets,
  PossibleDelimiterOccurrence,
  SurroundingPairOffsets,
} from "./types";
import { weaklyContains } from "./weaklyContains";

/**
 * Looks for a surrounding pair where one of its delimiters contains the entire selection.
 *
 * @param initialIndex The index of the first delimiter to try within the delimiter occurrences list.  Expected to be
 * the index of the first delimiter whose end offset is greater than or equal to
 * the end offset of the selection.
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be sorted by offsets
 * @param selectionOffsets The offsets of the selection
 * @param bailOnUnmatchedAdjacent If `true`, immediately return null if we find
 * an adjacent delimiter that we can't find a match for.  This variable will
 * be true if the current iteration can't see the full document.  In that
 * case, we'd like to fail and let a subsequent pass try again in case
 * the matching delimiter is outside the range we're looking.
 * @returns The offsets of a surrounding pair, one of whose delimiters is
 * adjacent to or containing the selection.  Returns `null` if such a pair
 * can't be found in the given list of delimiter occurrences.
 */
export function findDelimiterPairAdjacentToSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  selectionOffsets: Offsets,
  scopeType: SurroundingPairScopeType,
  bailOnUnmatchedAdjacent: boolean = false,
): SurroundingPairOffsets | null {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const delimiterOccurrence = delimiterOccurrences[index];

    if (
      delimiterOccurrence != null &&
      weaklyContains(delimiterOccurrence.offsets, selectionOffsets)
    ) {
      const { delimiterInfo } = delimiterOccurrence;

      if (delimiterInfo != null) {
        const possibleMatch = findOppositeDelimiter(
          delimiterOccurrences,
          index,
          delimiterInfo,
          scopeType.forceDirection,
        );

        if (possibleMatch != null) {
          const surroundingPairOffsets = getSurroundingPairOffsets(
            delimiterOccurrence as DelimiterOccurrence,
            possibleMatch,
          );

          if (
            !scopeType.requireStrongContainment ||
            (surroundingPairOffsets.leftDelimiter.start <
              selectionOffsets.start &&
              surroundingPairOffsets.rightDelimiter.end > selectionOffsets.end)
          ) {
            return surroundingPairOffsets;
          }
        } else if (bailOnUnmatchedAdjacent) {
          return null;
        }
      }
    }
  }

  return null;
}
