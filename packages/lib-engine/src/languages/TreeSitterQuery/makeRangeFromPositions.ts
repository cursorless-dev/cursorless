import type { Point } from "web-tree-sitter";
import { Range } from "@cursorless/lib-common";

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
