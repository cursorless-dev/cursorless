import { escapeRegExp, sortedIndexBy, uniq } from "lodash";
import { Delimiter } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairWeaklyContainingSelection } from "./findDelimiterPairWeaklyContainingSelection";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { PairIndices, Offsets, PossibleDelimiterOccurrence } from "./types";
import { anyDelimiter } from "./delimiterMaps";

export function findSurroundingPairInText(
  text: string,
  selectionOffsets: Offsets,
  delimiter: Delimiter | null
): PairIndices | null {
  const delimitersToCheck = delimiter == null ? anyDelimiter : [delimiter];

  const individualDelimiters = getIndividualDelimiters(delimitersToCheck);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  const delimiterRegex = new RegExp(
    uniq(individualDelimiters.flatMap(({ text }) => [`\\${text}`, text]))
      .map(escapeRegExp)
      .join("|"),
    "gu"
  );

  const delimiterOccurrences: PossibleDelimiterOccurrence[] = matchAll(
    text,
    delimiterRegex,
    (match) => {
      const startOffset = match.index!;
      const text = match[0];
      return {
        offsets: {
          start: startOffset,
          end: startOffset + text.length,
        },
        get delimiterInfo() {
          return delimiterTextToDelimiterInfoMap[text];
        },
      };
    }
  );

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
      selectionOffsets
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
