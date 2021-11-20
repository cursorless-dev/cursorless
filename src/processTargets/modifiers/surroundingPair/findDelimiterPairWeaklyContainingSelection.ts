import { getDelimiterPair } from "./getDelimiterPair";
import {
  PairIndices,
  DelimiterMatch,
  IndividualDelimiter
} from "./types";
import { generateUnmatchedDelimiters } from "./generateUnmatchedDelimiters";

export function findDelimiterPairWeaklyContainingSelection(
  initialIndex: number,
  delimiterMatches: DelimiterMatch[],
  individualDelimiters: IndividualDelimiter[],
  selectionStartIndex: number): PairIndices | null {
  const rightDelimiters = individualDelimiters.filter(
    ({ direction }) => direction === "bidirectional" || direction === "left"
  );
  let leftDelimiters: IndividualDelimiter[] = [];

  const rightDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex,
    () => rightDelimiters,
    true
  );

  const leftDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex - 1,
    () => leftDelimiters,
    false
  );

  while (true) {
    let rightNext = rightDelimiterGenerator.next();
    if (rightNext.done) {
      return null;
    }
    let rightMatch = rightNext.value!;

    leftDelimiters = [rightMatch.delimiterInfo.opposite];
    let leftNext = leftDelimiterGenerator.next();
    if (leftNext.done) {
      return null;
    }
    let leftMatch = leftNext.value!.match;

    if (leftMatch.startIndex <= selectionStartIndex) {
      return getDelimiterPair(leftMatch, rightMatch.match);
    }
  }
}
