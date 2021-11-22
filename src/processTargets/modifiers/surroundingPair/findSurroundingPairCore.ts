import { sortedIndexBy } from "lodash";
import { SurroundingPairName } from "../../../typings/Types";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairContainingSelection } from "./findDelimiterPairContainingSelection";
import { SurroundingPairOffsets, Offsets, PossibleDelimiterOccurrence } from "./types";

export function findSurroundingPairCore(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  acceptableDelimiters: SurroundingPairName[],
  selectionOffsets: Offsets,
  bailOnUnmatchedAdjacent: boolean = false
): SurroundingPairOffsets | null {
  const initialIndex = sortedIndexBy<{
    offsets: Offsets;
  }>(
    delimiterOccurrences,
    {
      offsets: selectionOffsets,
    },
    "offsets.end"
  );

  const delimiterPairAdjacentToSelection: SurroundingPairOffsets | null =
    findDelimiterPairAdjacentToSelection(
      initialIndex,
      delimiterOccurrences,
      selectionOffsets,
      bailOnUnmatchedAdjacent
    );

  if (delimiterPairAdjacentToSelection != null) {
    return delimiterPairAdjacentToSelection;
  }

  return findDelimiterPairContainingSelection(
    initialIndex,
    delimiterOccurrences,
    acceptableDelimiters,
    selectionOffsets
  );
}
