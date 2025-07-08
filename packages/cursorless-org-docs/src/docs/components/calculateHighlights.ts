import {
  blendMultipleColors,
  BorderStyle,
  generateDecorationsForCharacterRange,
  getBorderColor,
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
    getHighlight(domainColors, d.range, d.style, 0),
  );
  const nestedRangeHighlights = nestedRangeDecorations.map((d) =>
    getHighlight(nestedRangeColors, d.range, d.style, 2),
  );
  const domainEqualsNestedHighlights = domainEqualsNestedDecorations.map((d) =>
    getHighlight(domainEqualsNestedColors, d.range, d.style, 1),
  );

  const allHighlights = [
    ...domainHighlights,
    ...nestedRangeHighlights,
    ...domainEqualsNestedHighlights,
  ];

  //   console.log(allHighlights.map((h) => h.range.toString()).sort());

  const positions = uniquePositions(
    allHighlights.flatMap((h) => [h.range.start, h.range.end]),
  );

  let highlights: Highlight[] = [];

  for (let i = 0; i < positions.length - 1; i++) {
    const subRange: Range = new Range(positions[i], positions[i + 1]);

    // if (subRange.start.line !== 0) {
    //   continue;
    // }

    // We have created ranges between two lines. Just skip these.
    if (!subRange.isSingleLine) {
      continue;
    }

    const matchingHighlights = allHighlights.filter(({ range }) =>
      range.contains(subRange),
    );

    if (matchingHighlights.length > 1) {
      console.log("--------------------");
      console.log(subRange.toString());
      //   for (const m of matchingHighlights) {
      //     console.log(m);
      //   }
    }

    const style = combineHighlightStyles(subRange, matchingHighlights);

    highlights.push({
      range: subRange,
      style,
      priority: 0,
    });
  }

  return highlights;
}

function combineHighlightStyles(range: Range, highlights: Highlight[]): Style {
  if (highlights.length === 1) {
    return highlights[0].style;
  }

  highlights.sort((a, b) => a.priority - b.priority);

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
    // TODO: Background color
    // backgroundColor,
    backgroundColor: lastHighlight.style.backgroundColor,
    borderStyle,
    borderColorSolid: lastHighlight.style.borderColorSolid,
    borderColorPorous: lastHighlight.style.borderColorPorous,
  };
}

// function getStrongestBorder(available: Set<BorderStyle>): BorderStyle {
//   if (available.has(BorderStyle.solid)) {
//     return BorderStyle.solid;
//   }
//   if (available.has(BorderStyle.porous)) {
//     return BorderStyle.porous;
//   }
//   return BorderStyle.none;
// }

function uniquePositions(positions: Position[]): Position[] {
  const result: Position[] = [];
  positions.sort(comparePos);
  for (let i = 0; i < positions.length; i++) {
    if (i === 0 || !positions[i].isEqual(positions[i - 1])) {
      result.push(positions[i]);
    }
  }
  return result;
}

function comparePos(a: Position, b: Position): number {
  return a.line === b.line ? a.character - b.character : a.line - b.line;
}

function getHighlight(
  colors: RangeTypeColors,
  range: Range,
  borders: DecorationStyle,
  priority: number,
): Highlight {
  return {
    range,
    priority,
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
