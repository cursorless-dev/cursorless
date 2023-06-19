import { CompositeKeyDefaultMap, Range } from "@cursorless/common";
import { groupBy } from "lodash";
import {
  StyleParametersRanges,
  StyleParameters,
  StyledRange,
} from "./getDecorationRanges.types";
import { ifilter, take } from "itertools";

export function getDifferentiatedRanges<T>(
  decoratedRanges: StyledRange<T>[],
  getKeyList: (style: T) => unknown[],
): StyleParametersRanges<T>[] {
  const groups = groupBy(decoratedRanges, ({ style }) =>
    getKeyList(style).join("\u0000"),
  );

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

  Object.entries(groups).forEach(([_, decoratedRanges]) => {
    decoratedRanges.sort((a, b) => a.range.start.compareTo(b.range.start));
    // Generate extra decorations as necessary to ensure that there are no
    // examples of the same decoration type touching each other.
    let currentRanges: RangeInfo[] = [];

    for (const { range, style } of decoratedRanges) {
      currentRanges = [
        ...currentRanges.filter(
          ({ range: previousRange }) =>
            previousRange.intersection(range) != null,
        ),
      ];

      const differentiationIndex = take(
        1,
        ifilter(
          irange(),
          (i) =>
            !currentRanges.some(
              ({ differentiationIndex }) => differentiationIndex === i,
            ),
        ),
      )[0];

      decorations
        .get({
          style,
          differentiationIndex,
        })
        .ranges.push(range);

      currentRanges.push({
        range,
        differentiationIndex,
      });
    }
  });

  return Array.from(decorations.values());
}

function* irange(): Iterable<number> {
  for (let i = 0; ; i++) {
    yield i;
  }
}

interface RangeInfo {
  range: Range;
  differentiationIndex: number;
}
