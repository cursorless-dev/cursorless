import { CompositeKeyDefaultMap } from "@cursorless/common";
import type {
  DifferentiatedStyle,
  DifferentiatedStyledRange,
  DifferentiatedStyledRangeList,
} from "./decorationStyle.types";
import { getDifferentiatedStyleMapKey } from "./getDifferentiatedStyleMapKey";

/**
 * Given a list of differentiated styled ranges, groups them by differentiated
 * style.
 *
 * @param decoratedRanges An iterable of differentiated styled ranges to group.
 * @returns A list where each elements contains a list of ranges that have the
 * same differentiated style.
 */
export function groupDifferentiatedStyledRanges(
  decoratedRanges: Iterable<DifferentiatedStyledRange>,
): DifferentiatedStyledRangeList[] {
  const decorations: CompositeKeyDefaultMap<
    DifferentiatedStyle,
    DifferentiatedStyledRangeList
  > = new CompositeKeyDefaultMap(
    (differentiatedStyle) => ({ differentiatedStyle, ranges: [] }),
    getDifferentiatedStyleMapKey,
  );

  for (const { range, differentiatedStyle } of decoratedRanges) {
    decorations.get(differentiatedStyle).ranges.push(range);
  }

  return Array.from(decorations.values());
}
