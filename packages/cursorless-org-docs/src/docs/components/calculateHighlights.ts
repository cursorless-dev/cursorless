import {
  blendMultipleColors,
  BorderStyle,
  generateDecorationsForCharacterRange,
  Range,
  type DecorationStyle,
  type Position,
} from "@cursorless/common";
import { blendRangeTypeColors } from "./blendRangeColors";
import { type Highlight, type Style } from "./Code";
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

function flattenHighlights(highlights: Highlight[]): Highlight[] {
  const positions = getUniquePositions(highlights);
  const results: Highlight[] = [];

  for (let i = 0; i < positions.length - 1; i++) {
    const subRange: Range = new Range(positions[i], positions[i + 1]);

    const matchingHighlights = highlights.filter(({ range }) =>
      range.contains(subRange),
    );

    // This sub range could be between two scopes.
    if (matchingHighlights.length === 0) {
      continue;
    }

    const style = combineHighlightStyles(subRange, matchingHighlights);

    results.push({
      range: subRange,
      style,
    });
  }

  return results;
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

function combineHighlightStyles(range: Range, highlights: Highlight[]): Style {
  if (highlights.length === 1) {
    return highlights[0].style;
  }

  const lastHighlight = highlights[highlights.length - 1];

  const borderStyle: DecorationStyle = {
    left: BorderStyle.none,
    right: BorderStyle.none,
    top: BorderStyle.none,
    bottom: BorderStyle.none,
  };

  borderStyle.top = lastHighlight.style.borderStyle.top;
  borderStyle.bottom = lastHighlight.style.borderStyle.bottom;

  const matchingStart = highlights.filter((h) =>
    h.range.start.isEqual(range.start),
  );
  const matchingEnd = highlights.filter((h) => h.range.end.isEqual(range.end));

  if (matchingStart.length > 0) {
    borderStyle.left = matchingStart.at(-1)!.style.borderStyle.left;
  }

  if (matchingEnd.length > 0) {
    borderStyle.right = matchingEnd.at(-1)!.style.borderStyle.right;
  }

  const backgroundColor = blendMultipleColors(
    highlights.map((h) => h.style.backgroundColor),
  );

  return {
    backgroundColor,
    borderStyle,
    borderColorSolid: lastHighlight.style.borderColorSolid,
    borderColorPorous: lastHighlight.style.borderColorPorous,
  };
}

function getUniquePositions(highlights: Highlight[]): Position[] {
  const result: Position[] = [];
  const emptyHighlights = highlights.filter((h) => h.range.isEmpty);
  const positions = highlights
    .flatMap((h) => [h.range.start, h.range.end])
    .sort((a, b) =>
      a.line === b.line ? a.character - b.character : a.line - b.line,
    );
  for (let i = 0; i < positions.length; i++) {
    if (
      i === 0 ||
      !positions[i].isEqual(positions[i - 1]) ||
      emptyHighlights.some((h) => h.range.start.isEqual(positions[i]))
    ) {
      result.push(positions[i]);
    }
  }
  return result;
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
