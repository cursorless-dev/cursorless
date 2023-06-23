import { CompositeKeyDefaultMap } from "@cursorless/common";
import {
  DifferentiatedStyledRangeList,
  DifferentiatedStyle,
  DifferentiatedStyledRange,
} from "./getDecorationRanges.types";

export function groupDifferentiatedStyledRanges(
  decoratedRanges: Iterable<DifferentiatedStyledRange>,
): DifferentiatedStyledRangeList[] {
  const decorations: CompositeKeyDefaultMap<
    DifferentiatedStyle,
    DifferentiatedStyledRangeList
  > = new CompositeKeyDefaultMap(
    (differentiatedStyles) => ({ differentiatedStyles, ranges: [] }),
    getStyleKey,
  );

  for (const { range, differentiatedStyle } of decoratedRanges) {
    decorations.get(differentiatedStyle).ranges.push(range);
  }

  return Array.from(decorations.values());
}

function getStyleKey({
  style: { top, right, left, bottom, isWholeLine },
  differentiationIndex,
}: DifferentiatedStyle) {
  return [top, right, left, bottom, isWholeLine ?? false, differentiationIndex];
}
