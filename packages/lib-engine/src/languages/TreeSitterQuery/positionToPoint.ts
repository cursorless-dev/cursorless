import type { Position } from "@cursorless/lib-common";
import type { Point } from "web-tree-sitter";

export function positionToPoint(start: Position): Point {
  return { row: start.line, column: start.character };
}
