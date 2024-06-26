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
    // TODO: Use Tree sitter to disqualify delimiter occurrences

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

      result.push({
        delimiter: occurrence.delimiter,
        leftStart: openDelimiter.start,
        leftEnd: openDelimiter.end,
        rightStart: occurrence.start,
        rightEnd: occurrence.end,
      });
    }
  }

  result.sort((a, b) => a.leftStart - b.leftStart);

  return result;
}
