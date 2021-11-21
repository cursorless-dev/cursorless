import { getDelimiterPair } from "./getDelimiterPair";
import {
  PairIndices,
  IndividualDelimiter,
  PossibleDelimiterOccurrence,
  Offsets,
} from "./types";
import { generateUnmatchedDelimiters } from "./generateUnmatchedDelimiters";

export function findDelimiterPairWeaklyContainingSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  acceptableIndividualDelimiters: IndividualDelimiter[],
  selectionOffsets: Offsets
): PairIndices | null {
  const acceptableRightDelimiters = acceptableIndividualDelimiters.filter(
    ({ side }) => side === "unknown" || side === "right"
  );
  let acceptableLeftDelimiters: IndividualDelimiter[] = [];

  const rightDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex,
    () => acceptableRightDelimiters,
    true
  );

  const leftDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex - 1,
    () => acceptableLeftDelimiters,
    false
  );

  while (true) {
    let rightNext = rightDelimiterGenerator.next();
    if (rightNext.done) {
      return null;
    }
    let rightDelimiterOccurrence = rightNext.value!;

    acceptableLeftDelimiters = [
      rightDelimiterOccurrence.delimiterInfo.opposite,
    ];
    let leftNext = leftDelimiterGenerator.next();
    if (leftNext.done) {
      return null;
    }
    let leftDelimiterOccurrence = leftNext.value!;

    if (leftDelimiterOccurrence.offsets.start <= selectionOffsets.start) {
      return getDelimiterPair(
        leftDelimiterOccurrence,
        rightDelimiterOccurrence
      );
    }
  }
}
