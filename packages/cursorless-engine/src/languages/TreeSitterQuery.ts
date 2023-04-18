import { Position, TextDocument } from "@cursorless/common";
import { Point, Query } from "web-tree-sitter";
import { TreeSitter } from "../typings/TreeSitter";

/**
 * Wrapper around a tree-sitter query that provides a more convenient API, and
 * defines our own custom set properties
 */
export class TreeSitterQuery {
  constructor(private treeSitter: TreeSitter, private query: Query) {}

  matches(document: TextDocument, start: Position, end: Position) {
    const rawMatches = this.query.matches(
      this.treeSitter.getTree(document).rootNode,
      positionToPoint(start),
      positionToPoint(end),
    );

    return rawMatches.filter((rawMatch) => {
      const { captures, setProperties } = rawMatch;

      if (setProperties == null) {
        return true;
      }

      if (
        "onlyIfNotDescendantOfType" in setProperties &&
        captures.some(
          ({ node }) =>
            node.parent?.type === setProperties.onlyIfNotDescendantOfType,
        )
      ) {
        return false;
      }

      return true;
    });
  }

  get captureNames() {
    return this.query.captureNames;
  }
}

function positionToPoint(start: Position): Point {
  return { row: start.line, column: start.character };
}
