import {
  GeneralizedRange,
  generalizedRangeContains,
  generalizedRangeTouches,
} from "@cursorless/common";

import { max } from "lodash";
import { DifferentiatedRange } from "./getDecorationRanges.types";

export function* generateDifferentiatedRanges(
  ranges: GeneralizedRange[],
): Iterable<DifferentiatedRange> {
  ranges.sort(compareGeneralizedRangesByStart);

  let currentRanges: DifferentiatedRange[] = [];

  for (const range of ranges) {
    currentRanges = [
      ...currentRanges.filter(
        ({ range: previousRange }) =>
          generalizedRangeTouches(previousRange, range) != null,
      ),
    ];

    const differentiatedRange = {
      range,
      differentiationIndex: getDifferentiationIndex(currentRanges, range),
    } as DifferentiatedRange;

    yield differentiatedRange;

    currentRanges.push(differentiatedRange);
  }
}

function getDifferentiationIndex(
  currentRanges: DifferentiatedRange[],
  range: GeneralizedRange,
): number {
  const maxContainingDifferentiationIndex = max(
    currentRanges
      .filter((r) => generalizedRangeContains(r.range, range))
      .map((r) => r.differentiationIndex),
  );

  if (maxContainingDifferentiationIndex != null) {
    return maxContainingDifferentiationIndex + 1;
  }

  for (let i = 0; ; i++) {
    if (
      !currentRanges.some(
        ({ differentiationIndex }) => differentiationIndex === i,
      )
    ) {
      return i;
    }
  }
}

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
    // Line ranges are always sorted before character ranges
    return a.start.line === b.start ? 1 : a.start.line - b.start;
  }

  if (b.type === "line") {
    // a.type === "line" && b.type === "line"
    return a.start - b.start;
  }

  // a.type === "line" && b.type === "character"
  return b.start.line === a.start ? -1 : a.start - b.start.line;
}
