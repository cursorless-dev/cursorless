import type { Range, SimpleScopeTypeType } from "@cursorless/common";
import type {
  QueryCapture,
  QueryMatch,
} from "../../../../languages/TreeSitterQuery/QueryCapture";
import { findCaptureByName } from "../TreeSitterScopeHandler/captureUtils";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

function getCaptures(
  queryMatches: QueryMatch[],
  captureName: SimpleScopeTypeType,
): Range[] {
  return queryMatches
    .map((match) => findCaptureByName(match, captureName)?.range)
    .filter((capture): capture is Range => capture != null);
}

export function getSurroundingPairOccurrences(
  queryMatches: QueryMatch[],
  individualDelimiters: IndividualDelimiter[],
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  const textFragments = getCaptures(queryMatches, "textFragment");
  const delimitersDisqualifiers = getCaptures(
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

  return result;
}
