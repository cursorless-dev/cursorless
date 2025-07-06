import { Range, sortRanges } from "@cursorless/common";
import { type Highlight } from "./Code";
import type { Fixture, RangeType } from "./types";

export function calculateHighlights(
  fixture: Fixture,
  rangeType: RangeType,
): Highlight[] {
  const highlights: Highlight[] = [];
  const domainRanges: Range[] = [];

  for (const scope of fixture.scopes) {
    const conciseRanges =
      rangeType === "content"
        ? scope.targets.map((t) => t.content)
        : scope.targets.map((t) => t.removal ?? t.content);
    const ranges = sortRanges(conciseRanges.map((r) => Range.fromConcise(r)));

    if (scope.domain != null && !conciseRanges.includes(scope.domain)) {
      domainRanges.push(Range.fromConcise(scope.domain));
    }

    for (const r of ranges) {
      let range = r;

      const overlap = highlights
        .map((h) => getOverlap(h.range, range))
        .find((o) => o != null);

      if (overlap != null) {
        highlights.push({
          type: rangeType,
          range: overlap,
        });
        range = new Range(overlap.end, range.end);
      }

      highlights.push({
        type: rangeType,
        range,
      });
    }
  }

  for (const range of domainRanges) {
    if (highlights.every((h) => !hasOverlap(h.range, range))) {
      highlights.push({
        type: "domain",
        range,
      });
    }
  }

  if (
    highlights.some((h) => highlights.some((o) => hasOverlap(h.range, o.range)))
  ) {
    console.error("Overlapping highlights detected:");
    console.error(fixture);
    console.error(highlights);
  }

  return highlights;
}

function hasOverlap(a: Range, b: Range): boolean {
  return getOverlap(a, b) != null;
}

function getOverlap(a: Range, b: Range): Range | null {
  const intersection = a.intersection(b);
  return intersection != null &&
    !intersection.isEmpty &&
    !a.contains(b) &&
    !b.contains(a)
    ? intersection
    : null;
}
