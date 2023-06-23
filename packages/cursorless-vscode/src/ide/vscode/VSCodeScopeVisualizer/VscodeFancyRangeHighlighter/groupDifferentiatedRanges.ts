import { CompositeKeyDefaultMap } from "@cursorless/common";
import {
  DifferentiatedStyledRangeList,
  DifferentiatedStyle,
  DifferentiatedStyledRange,
} from "./getDecorationRanges.types";

export function groupDifferentiatedRanges<T>(
  decoratedRanges: Iterable<DifferentiatedStyledRange<T>>,
  getKeyList: (style: T) => unknown[],
): DifferentiatedStyledRangeList<T>[] {
  const decorations: CompositeKeyDefaultMap<
    DifferentiatedStyle<T>,
    DifferentiatedStyledRangeList<T>
  > = new CompositeKeyDefaultMap(
    (differentiatedStyles) => ({ differentiatedStyles, ranges: [] }),
    ({ style, differentiationIndex }) => [
      ...getKeyList(style),
      differentiationIndex,
    ],
  );

  for (const { range, differentiatedStyle } of decoratedRanges) {
    decorations.get(differentiatedStyle).ranges.push(range);
  }

  return Array.from(decorations.values());
}
