import type { SimpleSurroundingPairName } from "@cursorless/common";
import { DefaultMap } from "@cursorless/common";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

/**
 * Given a list of occurrences of delimiters, returns a list of occurrences of
 * surrounding pairs by matching opening and closing delimiters.
 *
 * @param delimiterOccurrences A list of occurrences of delimiters
 * @returns A list of occurrences of surrounding pairs
 */
export function getSurroundingPairOccurrences(
  delimiterOccurrences: DelimiterOccurrence<IndividualDelimiter>[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  /**
   * A map from delimiter names to occurrences of the opening delimiter
   */
  const openingDelimiterOccurrences = new DefaultMap<
    SimpleSurroundingPairName,
    DelimiterOccurrence<IndividualDelimiter>[]
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

    /**
     * A list of opening delimiters that are relevant to the current occurrence.
     * We exclude delimiters that are not in the same text fragment range as the
     * current occurrence.
     */
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
        openingDelimiterRange: openingDelimiter.range,
        closingDelimiterRange: range,
      });
    }
  }

  return result;
}
