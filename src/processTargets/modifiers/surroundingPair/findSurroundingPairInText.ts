import { escapeRegExp, sortedIndexBy, uniq } from "lodash";
import { Delimiter } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairWeaklyContainingSelection } from "./findDelimiterPairWeaklyContainingSelection";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { PairIndices, DelimiterMatch } from "./types";
import { anyDelimiter } from "./delimiterMaps";

export function findSurroundingPairInText(
  text: string,
  selectionStartIndex: number,
  selectionEndIndex: number,
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

  const delimiterMatches: DelimiterMatch[] = matchAll(
    text,
    delimiterRegex,
    (match) => {
      const startIndex = match.index!;
      const text = match[0];
      return {
        text,
        startIndex,
        endIndex: startIndex + text.length,
      };
    }
  );

  const initialIndex = sortedIndexBy<{ endIndex: number }>(
    delimiterMatches,
    { endIndex: selectionEndIndex },
    "endIndex"
  );

  const delimiterPairAdjacentToSelection: PairIndices | null =
    findDelimiterPairAdjacentToSelection(
      initialIndex,
      delimiterMatches,
      selectionStartIndex,
      selectionEndIndex,
      delimiterTextToDelimiterInfoMap
    );

  if (delimiterPairAdjacentToSelection != null) {
    return delimiterPairAdjacentToSelection;
  }

  return findDelimiterPairWeaklyContainingSelection(
    initialIndex,
    delimiterMatches,
    individualDelimiters,
    selectionStartIndex
  );
}
