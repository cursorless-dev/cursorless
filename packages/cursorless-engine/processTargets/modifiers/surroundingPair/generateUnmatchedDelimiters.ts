import { range } from "lodash";
import { SimpleSurroundingPairName } from "@cursorless/common";
import {
  DelimiterOccurrence,
  DelimiterSide,
  PossibleDelimiterOccurrence,
} from "./types";

/**
 * Finds the first instance of an unmatched delimiter in the given direction
 *
 * This function is a simplified version of generateUnmatchedDelimiters, so look
 * there for details of the algorithm
 *
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be sorted by offsets
 * @param initialIndex The index of the delimiter to start from
 * @param acceptableDelimiters A list of names of acceptable delimiters to look
 * for
 * @param lookForward Whether to scan forwards or backwards
 * @returns The first acceptable unmatched delimiter, if one is found otherwise null
 */
export function findUnmatchedDelimiter(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  initialIndex: number,
  acceptableDelimiters: SimpleSurroundingPairName[],
  lookForward: boolean,
): DelimiterOccurrence | null {
  const generatorResult = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex,
    () => acceptableDelimiters,
    lookForward,
  ).next();

  return generatorResult.done ? null : generatorResult.value;
}

/**
 * This function is the heart of our surrounding pair algorithm.  It scans in
 * one direction (either forwards or backwards) through a list of delimiters,
 * yielding each unmatched delimiter that it finds.
 *
 * The algorithm proceeds by keeping a map from delimiter names to counts. Every
 * time it sees an instance of an opening or closing delimiter of the given
 * type, it will either increment or decrement the counter for the given
 * delimiter, depending which direction we're scanning.
 *
 * If the count for any delimiter drops to -1, we yield it because it means it
 * is unmatched.
 *
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be
 * sorted by offsets
 * @param initialIndex The index of the delimiter to start from
 * @param getCurrentAcceptableDelimiters A function that returns a list of names
 * of acceptable delimiters to look for.  We expect that this list might change
 * every time we yield, depending on the outcome of the scan in the other
 * direction
 * @param lookForward Whether to scan forwards or backwards
 * @yields Occurrences of unmatched delimiters
 */
export function* generateUnmatchedDelimiters(
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  initialIndex: number,
  getCurrentAcceptableDelimiters: () => SimpleSurroundingPairName[],
  lookForward: boolean,
): Generator<DelimiterOccurrence, void, never> {
  /**
   * This map tells us whether to increment or decrement our delimiter count
   * depending on which side delimiter we see. If we're looking forward, we
   * increment whenever we see a left delimiter, and decrement if we see a right
   * delimiter. If we're scanning backwards, we increment whenever we see a
   * right delimiter, and decrement if we see a left delimiter.
   *
   * We always decrement our count if side is `unknown`, (eg for a "`").
   * Otherwise we would just keep incrementing forever
   */
  const delimiterIncrements: Record<DelimiterSide, -1 | 1> = lookForward
    ? {
        left: 1,
        right: -1,
        unknown: -1,
      }
    : {
        left: -1,
        right: 1,
        unknown: -1,
      };

  /**
   * Maps from each delimiter name to a balance indicating how many left and
   * right delimiters of the given type we've seen. If this number drops to
   * -1 for any delimiter, we yield it.
   */
  const delimiterBalances: Partial<Record<SimpleSurroundingPairName, number>> =
    {};

  /**
   * The current list of acceptable delimiters in the ongoing scan segment. Each
   * time we yield, this list might change depending on what the other direction
   * found.
   */
  let currentAcceptableDelimiters = getCurrentAcceptableDelimiters();

  const indices = lookForward
    ? range(initialIndex, delimiterOccurrences.length, 1)
    : range(initialIndex, -1, -1);

  for (const index of indices) {
    const delimiterOccurrence = delimiterOccurrences[index];
    const { delimiterInfo } = delimiterOccurrence;
    const delimiterName = delimiterInfo?.delimiter;

    if (
      delimiterName == null ||
      !currentAcceptableDelimiters.includes(delimiterName)
    ) {
      continue;
    }

    const increment = delimiterIncrements[delimiterInfo!.side];
    const newDelimiterBalance =
      (delimiterBalances[delimiterName] ?? 0) + increment;

    if (newDelimiterBalance === -1) {
      yield delimiterOccurrence as DelimiterOccurrence;

      // Refresh the list of acceptable delimiters because it may have changed
      // depending on what the scan in the other direction found
      currentAcceptableDelimiters = getCurrentAcceptableDelimiters();

      // We reset the delimiter balance for the given delimiter to 0 because
      // if we are continuing, it means that the scan in the opposite direction
      // yielded an appropriate opposite matching delimiter.
      delimiterBalances[delimiterName] = 0;
    } else {
      delimiterBalances[delimiterName] = newDelimiterBalance;
    }
  }
}
