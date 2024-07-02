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
    if (occurrence.isDisqualified) {
      continue;
    }

    const side: "left" | "right" = (() => {
      if (occurrence.side === "unknown") {
        return openDelimiters.get(occurrence.delimiter)!.length % 2 === 0
          ? "left"
          : "right";
      }
      return occurrence.side;
    })();

    if (side === "left") {
      openDelimiters.get(occurrence.delimiter)!.push(occurrence);
    } else {
      const openDelimiter = openDelimiters.get(occurrence.delimiter)!.pop();

      if (openDelimiter == null) {
        continue;
      }

      if (
        occurrence.isSingleLine &&
        openDelimiter.start.line !== occurrence.start.line
      ) {
        if (occurrence.side === "unknown") {
          openDelimiters.get(occurrence.delimiter)!.push(occurrence);
        }
        continue;
      }

      if (
        occurrence.textFragment != null &&
        openDelimiter.textFragment != null
      ) {
        if (!occurrence.textFragment.isRangeEqual(openDelimiter.textFragment)) {
          if (occurrence.side === "unknown") {
            openDelimiters.get(occurrence.delimiter)!.push(occurrence);
          }
          continue;
        }
      } else if (
        occurrence.textFragment == null &&
        openDelimiter.textFragment != null
      ) {
        openDelimiters.get(occurrence.delimiter)!.push(openDelimiter);
        if (occurrence.side === "unknown") {
          openDelimiters.get(occurrence.delimiter)!.push(occurrence);
        }
        continue;
      } else if (
        occurrence.textFragment != null &&
        openDelimiter.textFragment == null
      ) {
        if (occurrence.side === "unknown") {
          openDelimiters.get(occurrence.delimiter)!.push(occurrence);
        }
        continue;
      }

      result.push({
        delimiter: occurrence.delimiter,
        leftStart: openDelimiter.start,
        leftEnd: openDelimiter.end,
        rightStart: occurrence.start,
        rightEnd: occurrence.end,
      });
    }
  }

  return result;
}
