import {
  generateDecorationsForCharacterRange,
  Range,
  type DecorationStyle,
} from "@cursorless/common";
import { blendRangeTypeColors } from "./blendRangeColors";
import { type Highlight } from "./Code";
import { flattenHighlights } from "./combineHighlightStyles";
import { highlightColors } from "./highlightColors";
import type { Fixture, RangeType, RangeTypeColors } from "./types";

export function calculateHighlights(
  fixture: Fixture,
  rangeType: RangeType,
): Highlight[] {
  const { domainRanges, allNestedRanges, domainEqualsNestedRanges } = getRanges(
    fixture,
    rangeType,
  );

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
    getHighlights(domainColors, d.range, d.style),
  );
  const nestedRangeHighlights = nestedRangeDecorations.map((d) =>
    getHighlights(nestedRangeColors, d.range, d.style),
  );
  const domainEqualsNestedHighlights = domainEqualsNestedDecorations.map((d) =>
    getHighlights(domainEqualsNestedColors, d.range, d.style),
  );

  return flattenHighlights([
    ...domainHighlights,
    ...nestedRangeHighlights,
    ...domainEqualsNestedHighlights,
  ]);
}

function getRanges(fixture: Fixture, rangeType: RangeType) {
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

  return { domainRanges, allNestedRanges, domainEqualsNestedRanges };
}

function getHighlights(
  colors: RangeTypeColors,
  range: Range,
  borders: DecorationStyle,
): Highlight {
  return {
    range,
    style: {
      backgroundColor: colors.background,
      borderColorSolid: colors.borderSolid,
      borderColorPorous: colors.borderPorous,
      borderStyle: borders,
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
