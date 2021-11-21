import { escapeRegExp, sortedIndexBy, uniq } from "lodash";
import { Delimiter } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { findDelimiterPairAdjacentToSelection } from "./findDelimiterPairAdjacentToSelection";
import { findDelimiterPairWeaklyContainingSelection } from "./findDelimiterPairWeaklyContainingSelection";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import {
  PairIndices,
  DelimiterOccurrence,
  DelimiterOffsets,
  IndividualDelimiter,
  DelimiterOccurrenceGenerator,
} from "./types";
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

  const delimiterMatches: DelimiterRegexMatch[] = matchAll(
    text,
    delimiterRegex,
    (match) => {
      const startOffset = match.index!;
      const text = match[0];
      return {
        text,
        offsets: {
          start: startOffset,
          end: startOffset + text.length,
        },
      };
    }
  );

  const initialIndex = sortedIndexBy<{
    offsets: {
      end: number;
    };
  }>(
    delimiterMatches,
    {
      offsets: {
        end: selectionEndIndex,
      },
    },
    "offsets.end"
  );

  const indicesToTry = [initialIndex + 1, initialIndex];
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

interface DelimiterRegexMatch {
  text: string;
  offsets: DelimiterOffsets;
}

function* generatePotentiallyAdjacentDelimiters(
  initialIndex: number,
  delimiterMatches: DelimiterRegexMatch[],
  delimiterTextToDelimiterInfoMap: { [k: string]: IndividualDelimiter }
): DelimiterOccurrenceGenerator {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const match = delimiterMatches[index];

    if (match != null) {
      const delimiterInfo = delimiterTextToDelimiterInfoMap[match.text];
      if (delimiterInfo != null) {
        yield {
          delimiterInfo,
          offsets: match.offsets,
        };
      }
    }
  }
}
