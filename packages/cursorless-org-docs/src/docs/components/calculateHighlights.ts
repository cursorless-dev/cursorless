import {
  BORDER_WIDTH,
  generateDecorationsForCharacterRange,
  getBorderColor,
  getBorderRadius,
  getBorderStyle,
  Range,
  type DecorationStyle,
} from "@cursorless/common";
import { blendRangeTypeColors } from "./blendRangeColors";
import { type Highlight } from "./Code";
import { highlightColors } from "./highlightColors";
import type { Fixture, RangeType, RangeTypeColors } from "./types";

export function calculateHighlights(
  fixture: Fixture,
  rangeType: RangeType,
): Highlight[] {
  //   const highlights: Highlight[] = [];
  //   const domainRanges: Range[] = [];

  //   for (const scope of fixture.scopes) {
  //     const conciseRanges =
  //       rangeType === "content"
  //         ? scope.targets.map((t) => t.content)
  //         : scope.targets.map((t) => t.removal ?? t.content);
  //     const ranges = conciseRanges.map((r) => Range.fromConcise(r));

  //     if (scope.domain != null && !conciseRanges.includes(scope.domain)) {
  //       domainRanges.push(Range.fromConcise(scope.domain));
  //     }

  //     for (const r of ranges) {
  //       let range = r;

  //       const overlap = highlights
  //         .map((h) => getOverlap(h.range, range))
  //         .find((o) => o != null);

  //       if (overlap != null) {
  //         highlights.push({
  //           type: rangeType,
  //           range: overlap,
  //         });
  //         range = new Range(overlap.end, range.end);
  //       }

  //       highlights.push({
  //         type: rangeType,
  //         range,
  //       });
  //     }
  //   }

  //   for (const range of domainRanges) {
  //     if (highlights.every((h) => !hasOverlap(h.range, range))) {
  //       highlights.push({
  //         type: "domain",
  //         range,
  //       });
  //     }
  //   }

  const domainRanges: Range[] = [];
  const allNestedRanges: Range[] = [];
  const domainEqualsNestedRanges: Range[] = [];

  for (const { domain, targets } of fixture.scopes) {
    const nestedRanges = targets
      .map((t) =>
        rangeType === "content" ? t.content : (t.removal ?? t.content),
      )
      .map((r) => Range.fromConcise(r));

    const domainRange = domain != null ? Range.fromConcise(domain) : null;

    if (domainRange != null) {
      if (
        nestedRanges.length === 1 &&
        nestedRanges[0].isRangeEqual(domainRange)
      ) {
        domainEqualsNestedRanges.push(domainRange);
        continue;
      }

      domainRanges.push(domainRange);
    }

    allNestedRanges.push(...nestedRanges);
  }

  const codeLineRanges = getCodeLineRanges(fixture.code);
  const domainDecorations = getDecorations(codeLineRanges, domainRanges);
  const nestedRangeDecorations = getDecorations(
    codeLineRanges,
    allNestedRanges,
  );
  const domainEqualsNestedDecorations = getDecorations(
    codeLineRanges,
    domainEqualsNestedRanges,
  );

  const domainColors = highlightColors.domain;
  const nestedRangeColors =
    rangeType === "content" ? highlightColors.content : highlightColors.removal;
  const domainEqualsNestedColors = blendRangeTypeColors(
    domainColors,
    nestedRangeColors,
  );

  const domainHighlights = domainDecorations.map((d) =>
    getHighlight(domainColors, d.range, d.style),
  );
  const nestedRangeHighlights = nestedRangeDecorations.map((d) =>
    getHighlight(nestedRangeColors, d.range, d.style),
  );
  const domainEqualsNestedHighlights = domainEqualsNestedDecorations.map((d) =>
    getHighlight(domainEqualsNestedColors, d.range, d.style),
  );

  let highlights: Highlight[] = [
    ...domainHighlights,
    ...nestedRangeHighlights,
    ...domainEqualsNestedHighlights,
  ];

  //   console.log(domainHighlights);
  //   console.log(nestedRangeHighlights);
  // console.log(domainEqualsNestedHighlights);
  //   console.log(highlights);

  //   for (const h of nestedRangeHighlights) {
  //     console.log(h.range.concise());
  //   }

  //   if (
  //     highlights.length &&
  //     highlights.some(
  //       (h) => h.range.start.line === 2 && h.range.start.character === 4,
  //     ) &&
  //     highlights.some(
  //       (h) => h.range.start.line === 2 && h.range.start.character === 8,
  //     )
  //   ) {
  //     console.log(fixture.facet);
  //   }

  if (
    highlights.some((h) => highlights.some((o) => hasOverlap(h.range, o.range)))
  ) {
    console.log("--------------------");
    console.error("Overlapping highlights detected:");
    console.error(fixture);

    const conflicts = highlights
      .filter((h) => highlights.some((o) => hasOverlap(h.range, o.range)))
      .map((h) => h.range.concise())
      .sort();
    // for (const c of conflicts) {
    //   console.log(c);
    // }

    // console.error(highlights);
    highlights = highlights.filter(
      //   (h) => !highlights.some((o) => hasOverlap(h.range, o.range)),
      (h, index, self) => {
        const conflictIndex = self.findIndex((o) =>
          hasOverlap(h.range, o.range),
        );

        if (conflictIndex > -1 && conflictIndex < index) {
          console.log(
            `Conflict at index ${index} with ${conflictIndex}: ${h.range.concise()} vs ${self[conflictIndex].range.concise()}, ${h.style.borderStyle} vs ${self[conflictIndex].style.borderStyle}`,
          );
          return false;
        }

        // return conflictIndex === -1 || index < conflictIndex;
        return true;
      },
    );
    // console.log("**********");
    // for (const c of highlights) {
    //   console.log(c.range.concise());
    // }
    // highlights.length = 0;
  }

  //   console.log(highlights);

  return highlights;
}

function getHighlight(
  colors: RangeTypeColors,
  range: Range,
  borders: DecorationStyle,
): Highlight {
  return {
    range,
    style: {
      backgroundColor: colors.background,
      borderColor: getBorderColor(
        colors.borderSolid,
        colors.borderPorous,
        borders,
      ),
      borderStyle: getBorderStyle(borders),
      borderWidth: BORDER_WIDTH,
      borderRadius: getBorderRadius(borders),
    },
  };
}

function getDecorations(lineRanges: Range[], ranges: Range[]) {
  return ranges.flatMap((range) =>
    Array.from(
      generateDecorationsForCharacterRange(
        (range) => getLineRanges(lineRanges, range),
        new Range(range.start, range.end),
      ),
    ),
  );
}

function getCodeLineRanges(code: string): Range[] {
  return code
    .split("\n")
    .map((line, index) => new Range(index, 0, index, line.length));
}

function getLineRanges(lineRanges: Range[], range: Range): Range[] {
  return lineRanges.slice(range.start.line, range.end.line + 1);
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
