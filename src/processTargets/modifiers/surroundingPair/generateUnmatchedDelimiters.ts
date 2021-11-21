import { range } from "lodash";
import { Delimiter } from "../../../typings/Types";
import { DelimiterOccurrence, IndividualDelimiter, GeneratorResult } from "./types";

export function findUnmatchedDelimiter(
  delimiterMatches: DelimiterOccurrence[],
  initialIndex: number,
  delimitersToCheck: IndividualDelimiter[],
  lookForward: boolean
): DelimiterOccurrence | null {
  const generatorResult = generateUnmatchedDelimiters(
    delimiterMatches,
    initialIndex,
    () => delimitersToCheck,
    lookForward
  ).next();

  return generatorResult.done ? null : generatorResult.value.match;
}

export function* generateUnmatchedDelimiters(
  delimiterMatches: DelimiterOccurrence[],
  initialIndex: number,
  delimitersToCheck: () => IndividualDelimiter[],
  lookForward: boolean
): Generator<GeneratorResult, void, never> {
  const indices = lookForward
    ? range(initialIndex, delimiterMatches.length, 1)
    : range(initialIndex, -1, -1);

  let delimiterBalances: Partial<Record<Delimiter, number>> = {};
  for (const index of indices) {
    const match = delimiterMatches[index];

    const matchingDelimiter = delimitersToCheck().find(
      ({ text }) => text === match.text
    );

    // NB: We check for opposite text first because in the case of a match
    // where left and right are equal we want to make sure we end rather than
    // treating it as nested
    if (matchingDelimiter != null) {
      const matchingDelimiterName = matchingDelimiter.delimiter;

      const newDelimiterBalance =
        (delimiterBalances[matchingDelimiterName] ?? 1) - 1;

      if (newDelimiterBalance === 0) {
        yield { match, delimiterInfo: matchingDelimiter };
        delimiterBalances[matchingDelimiterName] = 1;
      } else {
        delimiterBalances[matchingDelimiterName] = newDelimiterBalance;
      }
    } else {
      const oppositeDelimiter = delimitersToCheck().find(
        ({ opposite: { text } }) => text === match.text
      );

      if (oppositeDelimiter != null) {
        const matchingDelimiterName = oppositeDelimiter.delimiter;

        delimiterBalances[matchingDelimiterName] =
          (delimiterBalances[matchingDelimiterName] ?? 1) + 1;
      }
    }
  }
}
