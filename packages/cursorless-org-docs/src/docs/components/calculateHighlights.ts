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
  const { domainRanges, removalRanges, contentRanges } = getRanges(
    fixture,
    rangeType,
  );

  const codeLineRanges = getCodeLineRanges(fixture.code);

  const highlights = getDecorations(codeLineRanges, domainRanges).map((d) =>
    getHighlights(highlightColors.domain, d.range, d.style),
  );

  if (rangeType === "blend" && !isIteration) {
    const removalHighlights = getDecorations(codeLineRanges, removalRanges).map(
      (d) => getHighlights(highlightColors.removal, d.range, d.style),
    );
    const contentHighlights = getDecorations(codeLineRanges, contentRanges).map(
      (d) => getHighlights(highlightColors.content, d.range, d.style),
    );

    highlights.push(...removalHighlights, ...contentHighlights);
  } else {
    const colors = getColors(rangeType, isIteration);
    const targetRangeHighlights = getDecorations(
      codeLineRanges,
      rangeType === "removal" ? removalRanges : contentRanges,
    ).map((d) => getHighlights(colors, d.range, d.style));

    highlights.push(...targetRangeHighlights);
  }

  const flattenedHighlights = flattenHighlights(highlights);

  return highlightsToDecorations(flattenedHighlights);
}

function getColors(rangeType: RangeType, isIteration: boolean) {
  if (isIteration) {
    return highlightColors.iteration;
  }
  if (rangeType === "content") {
    return highlightColors.content;
  }
  return highlightColors.removal;
}

function getRanges(fixture: Fixture, rangeType: RangeType) {
  const domainRanges: string[] = [];
  const removalRanges: string[] = [];
  const contentRanges: string[] = [];

  for (const { domain, targets } of fixture.scopes) {
    if (domain != null) {
      domainRanges.push(domain);
    }

    for (const t of targets) {
      if (rangeType === "blend") {
        if (t.removal != null) {
          removalRanges.push(t.removal);
        }
        contentRanges.push(t.content);
      } else if (rangeType === "removal") {
        removalRanges.push(t.removal ?? t.content);
      } else {
        contentRanges.push(t.content);
      }
    }
  }

  return {
    domainRanges: domainRanges.map(Range.fromConcise),
    removalRanges: removalRanges.map(Range.fromConcise),
    contentRanges: contentRanges.map(Range.fromConcise),
  };
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
