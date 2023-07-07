import { sortedIndexBy } from "lodash";
import {
  SimpleSurroundingPairName,
  SurroundingPairScopeType,
} from "@cursorless/common";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairContainingSelection } from "./findDelimiterPairContainingSelection";
import {
  SurroundingPairOffsets,
  Offsets,
  PossibleDelimiterOccurrence,
} from "./types";

/**
 * This function implements the core high-level surrounding pair algorithm
 * shared by both the parse tree and textual implementations.
 *
 * We first look for any delimiter pair where one of the delimiters itself
 * contains our selection, for example if the user refers to a mark which is a
 * delimiter token, or if the user's cursor is right next to a delimiter.
 *
 * If we don't find a delimiter pair that way, we instead look for the smallest
 * delimiter pair that contains the selection.
 *
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be sorted by offsets
 * @param acceptableDelimiters A list of names of acceptable delimiters to look for
 * @param selectionOffsets The offsets of the selection
 * @param bailOnUnmatchedAdjacent If `true`, immediately return null if we find
 * an adjacent delimiter that we can't find a match for.  This variable will
 * be true if the current iteration can't see the full document.  In that
 * case, we'd like to fail and let a subsequent pass try again in case
 * the matching delimiter is outside the range we're looking.
 * @returns
 */
export function findSurroundingPairCore(
  scopeType: SurroundingPairScopeType,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  acceptableDelimiters: SimpleSurroundingPairName[],
  selectionOffsets: Offsets,
  bailOnUnmatchedAdjacent: boolean = false,
): SurroundingPairOffsets | null {
  /**
   * The initial index from which to start both of our searches.  We set this
   * index to the index of the first delimiter whose end offset is greater than
   * or equal to the end offset of the selection.
   */
  const initialIndex = sortedIndexBy<{
    offsets: Offsets;
  }>(
    delimiterOccurrences,
    {
      offsets: selectionOffsets,
    },
    "offsets.end",
  );

  // First look for delimiter pair where one delimiter contains the selection.
  const delimiterPairAdjacentToSelection: SurroundingPairOffsets | null =
    findDelimiterPairAdjacentToSelection(
      initialIndex,
      delimiterOccurrences,
      selectionOffsets,
      scopeType,
      bailOnUnmatchedAdjacent,
    );

  if (delimiterPairAdjacentToSelection != null) {
    return delimiterPairAdjacentToSelection;
  }

  // Then look for the smallest delimiter pair containing the selection.
  return findDelimiterPairContainingSelection(
    initialIndex,
    delimiterOccurrences,
    acceptableDelimiters,
    selectionOffsets,
    scopeType,
  );
}
