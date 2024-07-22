import { DefaultMap, SimpleSurroundingPairName } from "@cursorless/common";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

export function getSurroundingPairOccurrences(
  acceptableDelimiters: IndividualDelimiter[],
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
      delimiterInfo: { delimiterName, side: sideRaw, isSingleLine },
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

    const side: "left" | "right" = (() => {
      if (sideRaw === "unknown") {
        return relevantOpeningDelimiters.length % 2 === 0 ? "left" : "right";
      }
      return sideRaw;
    })();

    if (side === "left") {
      openingDelimiters.push(occurrence);
    } else {
      const openingDelimiter = openingDelimiters.pop();

      if (openingDelimiter == null) {
        continue;
      }

      if (
        openingDelimiter.textFragmentRange != null &&
        textFragmentRange != null
      ) {
        if (
          !openingDelimiter.textFragmentRange.isRangeEqual(textFragmentRange)
        ) {
          if (sideRaw === "unknown") {
            openingDelimiters.push(occurrence);
          }
          continue;
        }
      } else if (
        openingDelimiter.textFragmentRange == null &&
        textFragmentRange != null
      ) {
        openingDelimiters.push(openingDelimiter);
        if (sideRaw === "unknown") {
          openingDelimiters.push(occurrence);
        }
        continue;
      } else if (
        openingDelimiter.textFragmentRange != null &&
        textFragmentRange == null
      ) {
        if (sideRaw === "unknown") {
          openingDelimiters.push(occurrence);
        }
        continue;
      }

      result.push({
        delimiter: delimiterName,
        left: openingDelimiter.range,
        right: range,
      });
    }
  }

  return result;
}
