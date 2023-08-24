import type { GeneralizedRange } from "@cursorless/common";
import {
  generalizedRangeContains,
  generalizedRangeTouches,
} from "@cursorless/common";

import { max } from "lodash";
import type { DifferentiatedGeneralizedRange } from "./decorationStyle.types";

/**
 * Given a list of generalized ranges, returns a list of differentiated ranges,
 * where any ranges that are touching have different differentiation indices.
 * We ensure that nested ranges have a greater differentiation index than their
 * parents, so that we can then render them in order of increasing
 * differentiation index to ensure that nested ranges are rendered after their
 * parents, so that we don't get strange interleaving artifacts.
 * @param ranges A list of generalized ranges.
 * @returns An iterable of differentiated generalized ranges.
 */
export function* generateDifferentiatedRanges(
  ranges: GeneralizedRange[],
): Iterable<DifferentiatedGeneralizedRange> {
  ranges.sort(compareGeneralizedRangesByStart);

  /** A list of ranges that may touch the current range */
  let currentRanges: DifferentiatedGeneralizedRange[] = [];

  for (const range of ranges) {
    // Remove any ranges that have ended before the start of the current range.
    currentRanges = [
      ...currentRanges.filter(({ range: previousRange }) =>
        generalizedRangeTouches(previousRange, range),
      ),
    ];

    const differentiatedRange = {
      range,
      differentiationIndex: getDifferentiationIndex(currentRanges, range),
    } as DifferentiatedGeneralizedRange;

    yield differentiatedRange;

    currentRanges.push(differentiatedRange);
  }
}

/**
 * Returns the differentiation index to use for the given range, given a list of
 * ranges that touch the current range. We return a differentiation index that
 * differs from any of the given ranges, and is greater than any range
 * containing {@link range}.
 *
 * @param currentRanges A list of ranges that touch the current range
 * @param range The range to get the differentiation index for
 * @returns The differentiation index to use for the given range
 */
function getDifferentiationIndex(
  currentRanges: DifferentiatedGeneralizedRange[],
  range: GeneralizedRange,
): number {
  const maxContainingDifferentiationIndex = max(
    currentRanges
      .filter((r) => generalizedRangeContains(r.range, range))
      .map((r) => r.differentiationIndex),
  );

  let i =
    maxContainingDifferentiationIndex == null
      ? 0
      : maxContainingDifferentiationIndex + 1;

  for (; ; i++) {
    if (
      !currentRanges.some(
        ({ differentiationIndex }) => differentiationIndex === i,
      )
    ) {
      return i;
    }
  }
}

/**
 * Compares two generalized ranges by their start positions, with line ranges
 * sorted before character ranges that start on the same line.
 * @param a A generalized range
 * @param b A generalized range
 * @returns -1 if {@link a} should be sorted before {@link b}, 1 if {@link b}
 * should be sorted before {@link a}, and 0 if they are equal.
 */
function compareGeneralizedRangesByStart(
  a: GeneralizedRange,
  b: GeneralizedRange,
): number {
  if (a.type === "character") {
    if (b.type === "character") {
      // a.type === "character" && b.type === "character"
      return a.start.compareTo(b.start);
    }

    // a.type === "character" && b.type === "line"
    // Line ranges are always sorted before character ranges that start on the
    // same line.
    return a.start.line === b.start ? 1 : a.start.line - b.start;
  }

  if (b.type === "line") {
    // a.type === "line" && b.type === "line"
    return a.start - b.start;
  }

  // a.type === "line" && b.type === "character"
  return a.start === b.start.line ? -1 : a.start - b.start.line;
}
