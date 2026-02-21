import type { Range } from "@cursorless/common";
import findLastIndex from "lodash-es/findLastIndex";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

interface ResolvedDelimiterOccurrence {
  delimiterInfo: IndividualDelimiter;
  range: Range;
  textFragmentRange: Range | undefined;
}

/**
 * Given a list of occurrences of delimiters, returns a list of occurrences of
 * surrounding pairs by matching opening and closing delimiters.
 *
 * @param delimiterOccurrences A list of occurrences of delimiters
 * @returns A list of occurrences of surrounding pairs
 */
export function getSurroundingPairOccurrences(
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];
  const openingDelimitersStack: ResolvedDelimiterOccurrence[] = [];

  for (const occurrence of delimiterOccurrences) {
    // One token can represent multiple delimiters (eg ")" could close
    // `parentheses` or Ruby `%Q(`), so pick the best closing interpretation
    // based on currently open delimiters.
    const closestOpeningDelimiterMatch = getClosestOpeningDelimiterMatch(
      occurrence,
      openingDelimitersStack,
    );

    if (closestOpeningDelimiterMatch != null) {
      const { delimiterInfo, openingDelimiterIndex } =
        closestOpeningDelimiterMatch;
      const openingDelimiter = openingDelimitersStack[openingDelimiterIndex];

      // Pop stack up to and including the opening delimiter
      openingDelimitersStack.length = openingDelimiterIndex;

      result.push({
        delimiterName: delimiterInfo.delimiterName,
        openingDelimiterRange: openingDelimiter.range,
        closingDelimiterRange: occurrence.range,
      });
    } else {
      const openingDelimiterInfo = occurrence.delimiterInfos.find(
        ({ side }) => side === "left" || side === "unknown",
      );

      // Pure closing delimiters with no matching opener are ignored.
      if (openingDelimiterInfo == null) {
        continue;
      }

      // If this token can't close anything, treat it as an opener.
      openingDelimitersStack.push({
        delimiterInfo: openingDelimiterInfo,
        range: occurrence.range,
        textFragmentRange: occurrence.textFragmentRange,
      });
    }
  }

  return result;
}

function getClosestOpeningDelimiterMatch(
  occurrence: DelimiterOccurrence,
  openingDelimitersStack: ResolvedDelimiterOccurrence[],
):
  | { delimiterInfo: IndividualDelimiter; openingDelimiterIndex: number }
  | undefined {
  // When multiple interpretations are possible, choose the one whose opener is
  // closest on the stack, which preserves normal nesting behavior.
  return occurrence.delimiterInfos.reduce<
    | { delimiterInfo: IndividualDelimiter; openingDelimiterIndex: number }
    | undefined
  >((closestMatch, delimiterInfo) => {
    if (delimiterInfo.side === "left") {
      return closestMatch;
    }

    const openingDelimiterIndex = findLastIndex(
      openingDelimitersStack,
      (o) =>
        o.delimiterInfo.delimiterName === delimiterInfo.delimiterName &&
        isSameTextFragment(o.textFragmentRange, occurrence.textFragmentRange) &&
        isValidLine(delimiterInfo.isSingleLine, o.range, occurrence.range),
    );

    // Keep the existing candidate unless this interpretation found a valid
    // opener that is strictly closer (larger stack index).
    if (
      openingDelimiterIndex === -1 ||
      (closestMatch != null &&
        closestMatch.openingDelimiterIndex >= openingDelimiterIndex)
    ) {
      return closestMatch;
    }

    return { delimiterInfo, openingDelimiterIndex };
  }, undefined);
}

function isSameTextFragment(
  a: Range | undefined,
  b: Range | undefined,
): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  return a.isRangeEqual(b);
}

function isValidLine(isSingleLine: boolean, a: Range, b: Range): boolean {
  return !isSingleLine || a.start.line === b.start.line;
}
