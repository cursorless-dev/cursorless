import { CompositeKeyDefaultMap } from "@cursorless/common";
import {
  StyleParametersRanges,
  StyleParameters,
  DifferentiatedStyledRange,
} from "./getDecorationRanges.types";

export function groupDifferentiatedRanges<T>(
  decoratedRanges: Iterable<DifferentiatedStyledRange<T>>,
  getKeyList: (style: T) => unknown[],
): StyleParametersRanges<T>[] {
  const decorations: CompositeKeyDefaultMap<
    StyleParameters<T>,
    StyleParametersRanges<T>
  > = new CompositeKeyDefaultMap(
    (styleParameters) => ({ styleParameters, ranges: [] }),
    ({ style, differentiationIndex }) => [
      ...getKeyList(style),
      differentiationIndex,
    ],
  );

  for (const { range, style, differentiationIndex } of decoratedRanges) {
    decorations
      .get({
        style,
        differentiationIndex,
      })
      .ranges.push(range);
  }

  return Array.from(decorations.values());
}
