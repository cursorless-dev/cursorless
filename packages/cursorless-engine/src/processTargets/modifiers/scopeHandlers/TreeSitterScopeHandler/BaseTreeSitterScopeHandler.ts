import { Direction, Position, TextEditor } from "@cursorless/common";
import { Query, QueryMatch } from "web-tree-sitter";
import { TreeSitter } from "../../../..";
import { compareTargetScopes } from "../compareTargetScopes";
import { TargetScope } from "../scope.types";
import { ScopeIteratorRequirements } from "../scopeHandler.types";
import { getQueryRange } from "./getQueryRange";
import BaseScopeHandler from "../BaseScopeHandler";
import { positionToPoint } from "./getCaptureRangeByName";

export abstract class BaseTreeSitterScopeHandler extends BaseScopeHandler {
  constructor(protected treeSitter: TreeSitter, protected query: Query) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { document } = editor;

    /** Narrow the range within which tree-sitter searches, for performance */
    const { start, end } = getQueryRange(document, position, direction, hints);

    yield* this.query
      .matches(
        this.treeSitter.getTree(document).rootNode,
        positionToPoint(start),
        positionToPoint(end),
      )
      .map((match) => this.matchToScope(editor, match))
      .filter((scope): scope is TargetScope => scope != null)
      .sort((a, b) => compareTargetScopes(direction, position, a, b));
  }

  protected abstract matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): TargetScope | undefined;
}
