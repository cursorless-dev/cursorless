import {
  Direction,
  Position,
  ScopeType,
  SimpleScopeType,
  TextDocument,
  TextEditor,
} from "@cursorless/common";

import { TreeSitter } from "../../..";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import BaseScopeHandler from "./BaseScopeHandler";
import { TargetScope } from "./scope.types";
import { Point, Query, QueryMatch } from "web-tree-sitter";
import { getNodeRange } from "../../../util/nodeSelectors";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export class TreeSitterScopeHandler extends BaseScopeHandler {
  protected isHierarchical: boolean = true;

  constructor(
    private treeSitter: TreeSitter,
    private query: Query,
    public scopeType: SimpleScopeType,
  ) {
    super();
  }

  public get iterationScopeType(): ScopeType {
    throw Error("Not implemented");
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;

    const { start, end } = this.getQueryRange(
      document,
      position,
      direction,
      hints,
    );

    const matches = this.query
      .matches(
        this.treeSitter.getTree(document).rootNode,
        positionToPoint(start),
        positionToPoint(end),
      )
      .filter(({ captures }) =>
        captures.some((capture) => capture.name === this.scopeType.type),
      );

    // FIXME: Sort?

    for (const match of matches) {
      yield this.matchToScope(editor, match);
    }
  }

  private getQueryRange(
    document: TextDocument,
    position: Position,
    direction: Direction,
    { containment, distalPosition }: ScopeIteratorRequirements,
  ) {
    const offset = document.offsetAt(position);
    const distalOffset =
      distalPosition == null ? null : document.offsetAt(distalPosition);

    if (containment === "required") {
      return {
        start: document.positionAt(offset - 1),
        end: document.positionAt(offset + 1),
      };
    }

    const proximalShift = containment === "disallowed" ? 1 : -1;

    // FIXME: Don't go all the way to end of document when there is no distalPosition?
    // Seems wasteful to query all the way to end of document for something like "next funk"
    // Might be better to start smaller and exponentially grow
    return direction === "forward"
      ? {
          start: document.positionAt(offset + proximalShift),
          end:
            distalOffset == null
              ? document.range.end
              : document.positionAt(distalOffset + 1),
        }
      : {
          start:
            distalOffset == null
              ? document.range.start
              : document.positionAt(distalOffset - 1),
          end: document.positionAt(offset - proximalShift),
        };
  }

  private matchToScope(editor: TextEditor, match: QueryMatch): TargetScope {
    const contentRange = getNodeRange(
      match.captures.find((capture) => capture.name === this.scopeType.type)!
        .node,
    );

    return {
      editor,
      // FIXME: Actually get domain
      domain: contentRange,
      getTarget: (isReversed) =>
        new ScopeTypeTarget({
          scopeTypeType: this.scopeType.type,
          editor,
          isReversed,
          contentRange,
          // FIXME: Actually get removalRange
          removalRange: contentRange,
          // FIXME: Other fields here
        }),
    };
  }
}

function positionToPoint(start: Position): Point | undefined {
  return { row: start.line, column: start.character };
}
