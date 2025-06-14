import { Range } from "@cursorless/common";
import type { Point } from "web-tree-sitter";

export function makeRangeFromPositions(
  startPosition: Point,
  endPosition: Point,
) {
  return new Range(
    startPosition.row,
    startPosition.column,
    endPosition.row,
    endPosition.column,
  );
}
