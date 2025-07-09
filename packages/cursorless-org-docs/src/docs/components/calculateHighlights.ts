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
  isIteration: boolean,
): DecorationItem[] {
  const { domainRanges, targetRanges } = getRanges(fixture, rangeType);

  const codeLineRanges = getCodeLineRanges(fixture.code);
  const colors = getColors(rangeType, isIteration);

  const domainDecorations = getDecorations(codeLineRanges, domainRanges);
  const targetRangeDecorations = getDecorations(codeLineRanges, targetRanges);

  const domainHighlights = domainDecorations.map((d) =>
    getHighlights(colors.domain, d.range, d.style),
  );
  const targetRangeHighlights = targetRangeDecorations.map((d) =>
    getHighlights(colors.target, d.range, d.style),
  );

  const highlights = flattenHighlights([
    ...domainHighlights,
    ...targetRangeHighlights,
  ]);

  return highlightsToDecorations(highlights);
}

function getColors(rangeType: RangeType, isIteration: boolean) {
  const target = (() => {
    if (isIteration) {
      return highlightColors.iteration;
    }
    if (rangeType === "content") {
      return highlightColors.content;
    }
    return highlightColors.removal;
  })();
  return {
    domain: highlightColors.domain,
    target,
  };
}

function getRanges(fixture: Fixture, rangeType: RangeType) {
  const domainRanges: Range[] = [];
  const targetRanges: Range[] = [];

  for (const { domain, targets } of fixture.scopes) {
    if (domain != null) {
      domainRanges.push(Range.fromConcise(domain));
    }

    for (const t of targets) {
      const range =
        rangeType === "content" ? t.content : (t.removal ?? t.content);
      targetRanges.push(Range.fromConcise(range));
    }
  }

  return { domainRanges, targetRanges };
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
