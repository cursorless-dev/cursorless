import type { SimpleSurroundingPairName } from "@cursorless/common";
import { DefaultMap } from "@cursorless/common";
import type {
  CollectionItemOccurrence,
  DelimiterOccurrence,
  IndividualDelimiter,
  IndividualSeparator,
} from "../SurroundingPairScopeHandler/types";

interface DelimiterEntry {
  openingDelimiter: DelimiterOccurrence<IndividualDelimiter>;
  separator?: DelimiterOccurrence<IndividualSeparator>;
}

/**
 * Given a list of occurrences of delimiters, returns a list of occurrences of
 * surrounding pairs by matching opening and closing delimiters.
 *
 * @param delimiterOccurrences A list of occurrences of delimiters
 * @returns A list of occurrences of surrounding pairs
 */
export function getCollectionItemOccurrences(
  delimiterOccurrences: DelimiterOccurrence<
    IndividualDelimiter | IndividualSeparator
  >[],
): CollectionItemOccurrence[] {
  const result: CollectionItemOccurrence[] = [];

  /**
   * A map from delimiter names to occurrences of the opening delimiter
   */
  const openingDelimiterOccurrences = new DefaultMap<
    SimpleSurroundingPairName,
    DelimiterEntry[]
  >(() => []);

  for (const occurrence of delimiterOccurrences) {
    const { delimiterInfo, isDisqualified, textFragmentRange, range } =
      occurrence;

    if (isDisqualified) {
      continue;
    }

    if (delimiterInfo.side === "separator") {
      const openingDelimiters = Array.from(
        openingDelimiterOccurrences.values(),
      ).flat();

      /**
       * A list of opening delimiters that are relevant to the current occurrence.
       * We exclude delimiters that are not in the same text fragment range as the
       * current occurrence.
       */
      const relevantOpeningDelimiters = openingDelimiters.filter(
        ({ openingDelimiter }) =>
          (textFragmentRange == null &&
            openingDelimiter.textFragmentRange == null) ||
          (textFragmentRange != null &&
            openingDelimiter.textFragmentRange != null &&
            openingDelimiter.textFragmentRange.isRangeEqual(textFragmentRange)),
      );

      relevantOpeningDelimiters.sort((a, b) =>
        a.openingDelimiter.range.start.isBefore(b.openingDelimiter.range.start)
          ? -1
          : 1,
      );

      const lastOpeningDelimiter = relevantOpeningDelimiters.at(-1);

      if (lastOpeningDelimiter == null) {
        // TODO: in this case, we are yielding entries on a line with no delimiters
        throw new Error("Not implemented");
      }

      result.push({
        openingDelimiterRange:
          lastOpeningDelimiter.separator?.range ??
          lastOpeningDelimiter.openingDelimiter.range,
        closingDelimiterRange: range,
      });

      lastOpeningDelimiter.separator =
        occurrence as DelimiterOccurrence<IndividualSeparator>;

      continue;
    }

    const { side, delimiterName, isSingleLine } = delimiterInfo;

    let openingDelimiters = openingDelimiterOccurrences.get(delimiterName);

    if (isSingleLine) {
      // If single line, remove all opening delimiters that are not on the same line
      // as occurrence
      openingDelimiters = openingDelimiters.filter(
        (openingDelimiter) =>
          openingDelimiter.openingDelimiter.range.start.line ===
          range.start.line,
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
          openingDelimiter.openingDelimiter.textFragmentRange == null) ||
        (textFragmentRange != null &&
          openingDelimiter.openingDelimiter.textFragmentRange != null &&
          openingDelimiter.openingDelimiter.textFragmentRange.isRangeEqual(
            textFragmentRange,
          )),
    );

    if (
      side === "left" ||
      (side === "unknown" && relevantOpeningDelimiters.length % 2 === 0)
    ) {
      openingDelimiters.push({
        openingDelimiter:
          occurrence as DelimiterOccurrence<IndividualDelimiter>,
      });
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
        openingDelimiterRange:
          openingDelimiter.separator?.range ??
          openingDelimiter.openingDelimiter.range,
        closingDelimiterRange: range,
      });
    }
  }

  return result;
}
