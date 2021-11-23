import { getDelimiterPair } from "./getDelimiterPair";
import {
  SurroundingPairOffsets,
  PossibleDelimiterOccurrence,
  Offsets,
} from "./types";
import { generateUnmatchedDelimiters } from "./generateUnmatchedDelimiters";
import { SimpleSurroundingPairName } from "../../../typings/Types";

export function findDelimiterPairContainingSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  acceptableDelimiters: SimpleSurroundingPairName[],
  selectionOffsets: Offsets
): SurroundingPairOffsets | null {
  const acceptableRightDelimiters = acceptableDelimiters;
  let acceptableLeftDelimiters: SimpleSurroundingPairName[] = [];

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
      rightDelimiterOccurrence.delimiterInfo.delimiter,
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
