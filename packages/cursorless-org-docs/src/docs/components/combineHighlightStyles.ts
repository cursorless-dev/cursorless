import {
  type DecorationStyle,
  type Position,
  blendMultipleColors,
  BorderStyle,
  Range,
} from "@cursorless/common";
import { type Highlight, type Style } from "./Code";

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
