import {
  type DecorationStyle,
  type Position,
  blendMultipleColors,
  BorderStyle,
  Range,
} from "@cursorless/common";
import type { BorderRadius, Highlight, Style } from "./types";

export function flattenHighlights(highlights: Highlight[]): Highlight[] {
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

function combineHighlightStyles(range: Range, highlights: Highlight[]): Style {
  const lastHighlight = highlights[highlights.length - 1];

  const borderStyle: DecorationStyle = {
    left: BorderStyle.none,
    right: BorderStyle.none,
    top: lastHighlight.style.borderStyle.top,
    bottom: lastHighlight.style.borderStyle.bottom,
  };
  const borderRadius: BorderRadius = {
    topLeft: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
  };

  const matchingStart = highlights.filter((h) =>
    h.range.start.isEqual(range.start),
  );
  const matchingEnd = highlights.filter((h) => h.range.end.isEqual(range.end));

  if (matchingStart.length > 0) {
    const start = matchingStart.at(-1)!;
    borderStyle.left = start.style.borderStyle.left;
    borderRadius.topLeft = start.style.borderRadius.topLeft;
    borderRadius.bottomLeft = start.style.borderRadius.bottomLeft;
  }

  if (matchingEnd.length > 0) {
    const end = matchingEnd.at(-1)!;
    borderStyle.right = end.style.borderStyle.right;
    borderRadius.topRight = end.style.borderRadius.topRight;
    borderRadius.bottomRight = end.style.borderRadius.bottomRight;
  }

  const backgroundColor = blendMultipleColors(
    highlights.map((h) => h.style.backgroundColor),
  );

  return {
    backgroundColor,
    borderStyle,
    borderRadius,
    borderColorSolid: lastHighlight.style.borderColorSolid,
    borderColorPorous: lastHighlight.style.borderColorPorous,
  };
}
