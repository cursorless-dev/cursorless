import type { Range, SimpleScopeTypeType } from "@cursorless/common";
import type { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { findCaptureByName } from "../TreeSitterScopeHandler/captureUtils";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

export function getSurroundingPairOccurrences(
  queryMatches: QueryMatch[],
  individualDelimiters: IndividualDelimiter[],
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  //   const textFragments = getCaptureRanges(queryMatches, "textFragment");
  const delimitersDisqualifiers = getCaptureRanges(
    queryMatches,
    "disqualifyDelimiter",
  );

  const openDelimiters = new Map<string, DelimiterOccurrence[]>(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.delimiter,
      [],
    ]),
  );

  for (const occurrence of delimiterOccurrences) {
    const occurrenceIsDisqualified = delimitersDisqualifiers.some(
      (range) =>
        range.start.isEqual(occurrence.start) &&
        range.end.isEqual(occurrence.end),
    );

    if (occurrenceIsDisqualified) {
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
        if (occurrence.side !== "right") {
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

function getCaptureRanges(
  queryMatches: QueryMatch[],
  captureName: SimpleScopeTypeType,
): Range[] {
  return queryMatches
    .map((match) => findCaptureByName(match, captureName)?.range)
    .filter((capture): capture is Range => capture != null);
}
