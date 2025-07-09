import {
  generateDecorationsForCharacterRange,
  Range,
  useSingleCornerBorderRadius,
  type DecorationStyle,
} from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { flattenHighlights } from "./flattenHighlights";
import { highlightColors } from "./highlightColors";
import { highlightsToDecorations } from "./highlightsToDecorations";
import type { Fixture, Highlight, RangeType, RangeTypeColors } from "./types";

export function generateDecorations(
  fixture: Fixture,
  rangeType: RangeType,
): DecorationItem[] {
  const { domainRanges, allNestedRanges } = getRanges(fixture, rangeType);

  const codeLineRanges = getCodeLineRanges(fixture.code);
  const domainDecorations = getDecorations(codeLineRanges, domainRanges);
  const nestedRangeDecorations = getDecorations(
    codeLineRanges,
    allNestedRanges,
  );

  const domainColors = highlightColors.domain;
  const nestedRangeColors =
    rangeType === "content" ? highlightColors.content : highlightColors.removal;

  const domainHighlights = domainDecorations.map((d) =>
    getHighlights(domainColors, d.range, d.style),
  );
  const nestedRangeHighlights = nestedRangeDecorations.map((d) =>
    getHighlights(nestedRangeColors, d.range, d.style),
  );

  const highlights = flattenHighlights([
    ...domainHighlights,
    ...nestedRangeHighlights,
  ]);

  return highlightsToDecorations(highlights);
}

function getRanges(fixture: Fixture, rangeType: RangeType) {
  const domainRanges: Range[] = [];
  const allNestedRanges: Range[] = [];

  for (const { domain, targets } of fixture.scopes) {
    const nestedRanges = targets
      .map((t) =>
        rangeType === "content" ? t.content : (t.removal ?? t.content),
      )
      .map((r) => Range.fromConcise(r));

    const domainRange = domain != null ? Range.fromConcise(domain) : null;

    if (domainRange != null) {
      domainRanges.push(domainRange);
    }

    allNestedRanges.push(...nestedRanges);
  }

  return { domainRanges, allNestedRanges };
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
      borderRadius: {
        topLeft: useSingleCornerBorderRadius(borders.top, borders.left),
        topRight: useSingleCornerBorderRadius(borders.top, borders.right),
        bottomRight: useSingleCornerBorderRadius(borders.bottom, borders.right),
        bottomLeft: useSingleCornerBorderRadius(borders.bottom, borders.left),
      },
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
