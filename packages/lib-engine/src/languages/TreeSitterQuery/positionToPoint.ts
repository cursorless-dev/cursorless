import type { Point } from "web-tree-sitter";
import type { Position } from "@cursorless/lib-common";

export function positionToPoint(start: Position): Point {
  return { row: start.line, column: start.character };
}
