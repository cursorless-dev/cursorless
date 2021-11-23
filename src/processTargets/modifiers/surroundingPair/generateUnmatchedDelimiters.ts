import { range } from "lodash";
import { SimpleSurroundingPairName } from "../../../typings/Types";
import {
  DelimiterOccurrence,
  IndividualDelimiter,
  PossibleDelimiterOccurrence,
} from "./types";

export function findUnmatchedDelimiter(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  initialIndex: number,
  acceptableDelimiters: SimpleSurroundingPairName[],
  lookForward: boolean
): DelimiterOccurrence | null {
  const generatorResult = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex,
    () => acceptableDelimiters,
    lookForward
  ).next();

  return generatorResult.done ? null : generatorResult.value;
}

export function* generateUnmatchedDelimiters(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  initialIndex: number,
  acceptableDelimiters: () => SimpleSurroundingPairName[],
  lookForward: boolean
): Generator<DelimiterOccurrence, void, never> {
  const indices = lookForward
    ? range(initialIndex, delimiterOccurrences.length, 1)
    : range(initialIndex, -1, -1);
  const side = lookForward ? "right" : "left";

  let delimiterBalances: Partial<Record<SimpleSurroundingPairName, number>> =
    {};
  for (const index of indices) {
    const delimiterOccurrence = delimiterOccurrences[index];
    const { delimiterInfo } = delimiterOccurrence;

    if (delimiterInfo == null) {
      continue;
    }

    const delimiterAcceptability = checkDelimiterAcceptability(
      acceptableDelimiters(),
      delimiterInfo,
      side
    );

    if (!delimiterAcceptability.isAcceptable) {
      continue;
    }

    const matchingDelimiterName = delimiterInfo.delimiter;

    switch (delimiterAcceptability.direction) {
      case "matching":
      case "unknown":
        // NB: We lump unknown in with matching because in the case of a match
        // where left and right are equal we want to make sure we end rather than
        // treating it as nested

        const newDelimiterBalance =
          (delimiterBalances[matchingDelimiterName] ?? 1) - 1;

        if (newDelimiterBalance === 0) {
          yield delimiterOccurrence as DelimiterOccurrence;
          delimiterBalances[matchingDelimiterName] = 1;
        } else {
          delimiterBalances[matchingDelimiterName] = newDelimiterBalance;
        }
        break;
      case "opposite":
        delimiterBalances[matchingDelimiterName] =
          (delimiterBalances[matchingDelimiterName] ?? 1) + 1;
        break;
    }
  }
}

type DelimiterAcceptability =
  | {
      isAcceptable: false;
    }
  | {
      isAcceptable: true;
      direction: "matching" | "opposite" | "unknown";
    };

function checkDelimiterAcceptability(
  acceptableDelimiters: SimpleSurroundingPairName[],
  delimiterInfo: IndividualDelimiter,
  expectedSide: "left" | "right"
): DelimiterAcceptability {
  if (delimiterInfo == null) {
    return {
      isAcceptable: false,
    };
  }

  const matchingDelimiter = acceptableDelimiters.find(
    (delimiter) => delimiter === delimiterInfo.delimiter
  );

  if (matchingDelimiter == null) {
    return {
      isAcceptable: false,
    };
  }

  const { side: actualSide } = delimiterInfo;

  return {
    isAcceptable: true,
    direction:
      actualSide === "unknown"
        ? "unknown"
        : actualSide === expectedSide
        ? "matching"
        : "opposite",
  };
}
