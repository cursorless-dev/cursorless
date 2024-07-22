import { DefaultMap, SimpleSurroundingPairName } from "@cursorless/common";
import type { DelimiterOccurrence, SurroundingPairOccurrence } from "./types";

export function getSurroundingPairOccurrences(
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  /**
   * A map from delimiter names to occurrences of the opening delimiter
   */
  const openingDelimiterOccurrences = new DefaultMap<
    SimpleSurroundingPairName,
    DelimiterOccurrence[]
  >(() => []);

  for (const occurrence of delimiterOccurrences) {
    const {
      delimiterInfo: { delimiterName, side, isSingleLine },
      isDisqualified,
      textFragmentRange,
      range,
    } = occurrence;

    if (isDisqualified) {
      continue;
    }

    let openingDelimiters = openingDelimiterOccurrences.get(delimiterName);

    if (isSingleLine) {
      // If single line, remove all opening delimiters that are not on the same line
      // as occurrence
      openingDelimiters = openingDelimiters.filter(
        (openingDelimiter) =>
          openingDelimiter.range.start.line === range.start.line,
      );
      openingDelimiterOccurrences.set(delimiterName, openingDelimiters);
    }

    const relevantOpeningDelimiters = openingDelimiters.filter(
      (openingDelimiter) =>
        (textFragmentRange == null &&
          openingDelimiter.textFragmentRange == null) ||
        (textFragmentRange != null &&
          openingDelimiter.textFragmentRange != null &&
          openingDelimiter.textFragmentRange.isRangeEqual(textFragmentRange)),
    );

    if (
      side === "left" ||
      (side === "unknown" && relevantOpeningDelimiters.length % 2 === 0)
    ) {
      openingDelimiters.push(occurrence);
    } else {
      const openingDelimiter = relevantOpeningDelimiters.at(-1);

      if (openingDelimiter == null) {
        continue;
      }

      openingDelimiters.splice(
        openingDelimiters.lastIndexOf(openingDelimiter),
        1,
      );

      result.push({
        delimiterName: delimiterName,
        left: openingDelimiter.range,
        right: range,
      });
    }
  }

  return result;
}
