import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

export function getSurroundingPairOccurrences(
  individualDelimiters: IndividualDelimiter[],
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  const openDelimiters = new Map<string, DelimiterOccurrence[]>(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.delimiter,
      [],
    ]),
  );

  for (const occurrence of delimiterOccurrences) {
    const {
      delimiterInfo: { delimiter, side: sideRaw, isSingleLine },
      isDisqualified,
    } = occurrence;

    if (isDisqualified) {
      continue;
    }

    const side: "left" | "right" = (() => {
      if (sideRaw === "unknown") {
        return openDelimiters.get(delimiter)!.length % 2 === 0
          ? "left"
          : "right";
      }
      return sideRaw;
    })();

    if (side === "left") {
      openDelimiters.get(delimiter)!.push(occurrence);
    } else {
      const openDelimiter = openDelimiters.get(delimiter)!.pop();

      if (openDelimiter == null) {
        continue;
      }

      if (
        isSingleLine &&
        openDelimiter.range.start.line !== occurrence.range.start.line
      ) {
        if (sideRaw === "unknown") {
          openDelimiters.get(delimiter)!.push(occurrence);
        }
        continue;
      }

      if (
        openDelimiter.textFragmentRange != null &&
        occurrence.textFragmentRange != null
      ) {
        if (
          !openDelimiter.textFragmentRange.isRangeEqual(
            occurrence.textFragmentRange,
          )
        ) {
          if (sideRaw === "unknown") {
            openDelimiters.get(delimiter)!.push(occurrence);
          }
          continue;
        }
      } else if (
        openDelimiter.textFragmentRange == null &&
        occurrence.textFragmentRange != null
      ) {
        openDelimiters.get(delimiter)!.push(openDelimiter);
        if (sideRaw === "unknown") {
          openDelimiters.get(delimiter)!.push(occurrence);
        }
        continue;
      } else if (
        openDelimiter.textFragmentRange != null &&
        occurrence.textFragmentRange == null
      ) {
        if (sideRaw === "unknown") {
          openDelimiters.get(delimiter)!.push(occurrence);
        }
        continue;
      }

      result.push({
        delimiter,
        left: openDelimiter.range,
        right: occurrence.range,
      });
    }
  }

  return result;
}
