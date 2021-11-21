import { sortedIndexBy } from "lodash";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairWeaklyContainingSelection } from "./findDelimiterPairWeaklyContainingSelection";
import {
  PairIndices,
  Offsets,
  PossibleDelimiterOccurrence,
  IndividualDelimiter,
} from "./types";

export function findSurroundingPairCore(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  individualDelimiters: IndividualDelimiter[],
  selectionOffsets: Offsets,
  bailOnUnmatchedAdjacent: boolean = false
): PairIndices | null {
  const initialIndex = sortedIndexBy<{
    offsets: Offsets;
  }>(
    delimiterOccurrences,
    {
      offsets: selectionOffsets,
    },
    "offsets.end"
  );

  const delimiterPairAdjacentToSelection: PairIndices | null =
    findDelimiterPairAdjacentToSelection(
      initialIndex,
      delimiterOccurrences,
      selectionOffsets,
      bailOnUnmatchedAdjacent
    );

  if (delimiterPairAdjacentToSelection != null) {
    return delimiterPairAdjacentToSelection;
  }

  return findDelimiterPairWeaklyContainingSelection(
    initialIndex,
    delimiterOccurrences,
    individualDelimiters,
    selectionOffsets
  );
}
