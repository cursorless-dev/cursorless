import {
  Direction,
  Position,
  ScopeType,
  SimpleScopeType,
  TextEditor,
} from "@cursorless/common";

import { Point, Query, QueryMatch } from "web-tree-sitter";
import { TreeSitter } from "../../..";
import { getNodeRange } from "../../../util/nodeSelectors";
import { PlainTarget } from "../../targets";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import BaseScopeHandler from "./BaseScopeHandler";
import { compareTargetScopes } from "./compareTargetScopes";
import { TargetScope } from "./scope.types";
import {
  CustomScopeType,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import { getQueryRange } from "./getQueryRange";

abstract class BaseTreeSitterScopeHandler extends BaseScopeHandler {
  protected isHierarchical: boolean = true;

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
      .filter((match) => this.includeMatch(match))
      .map((match) => this.matchToScope(editor, match))
      .sort((a, b) => compareTargetScopes(direction, position, a, b));
  }

  protected abstract includeMatch(match: QueryMatch): boolean;

  protected abstract matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): TargetScope;
}

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export class TreeSitterScopeHandler extends BaseTreeSitterScopeHandler {
  public get iterationScopeType(): CustomScopeType {
    return {
      type: "custom",
      scopeHandler: new TreeSitterIterationScopeHandler(
        this.treeSitter,
        this.query,
        this.scopeType,
      ),
    };
  }
  constructor(
    treeSitter: TreeSitter,
    query: Query,
    public scopeType: SimpleScopeType,
  ) {
    super(treeSitter, query);
  }

  protected includeMatch({ captures }: QueryMatch): boolean {
    return captures.some((capture) => capture.name === this.scopeType.type);
  }

  protected matchToScope(editor: TextEditor, match: QueryMatch): TargetScope {
    const scopeTypeType = this.scopeType.type;

    const contentRange = getNodeRange(
      match.captures.find((capture) => capture.name === scopeTypeType)!.node,
    );

    const domain =
      getRelatedRange(match, scopeTypeType, "domain") ?? contentRange;

    const removalRange = getRelatedRange(match, scopeTypeType, "removal");

    const leadingDelimiterRange = getRelatedRange(
      match,
      scopeTypeType,
      "leading",
    );

    const trailingDelimiterRange = getRelatedRange(
      match,
      scopeTypeType,
      "trailing",
    );

    const interiorRange = getRelatedRange(match, scopeTypeType, "interior");

    return {
      editor,
      domain,
      getTarget: (isReversed) =>
        new ScopeTypeTarget({
          scopeTypeType,
          editor,
          isReversed,
          contentRange,
          removalRange,
          leadingDelimiterRange,
          trailingDelimiterRange,
          interiorRange,
          // FIXME: Add delimiter text
        }),
    };
  }
}

export class TreeSitterIterationScopeHandler extends BaseTreeSitterScopeHandler {
  public get iterationScopeType(): ScopeType {
    throw Error("Not implemented");
  }

  public scopeType = undefined;

  constructor(
    treeSitter: TreeSitter,
    query: Query,
    private iterateeScopeType: SimpleScopeType,
  ) {
    super(treeSitter, query);
  }

  protected includeMatch({ captures }: QueryMatch): boolean {
    return (
      captures.some(
        (capture) =>
          capture.name === `${this.iterateeScopeType.type}.iteration`,
      ) ||
      (captures.some(
        (capture) => capture.name === this.iterateeScopeType.type,
      ) &&
        captures.some((capture) => capture.name === "iteration"))
    );
  }

  protected matchToScope(editor: TextEditor, match: QueryMatch): TargetScope {
    const scopeTypeType = this.iterateeScopeType.type;

    const contentRange = getRelatedRange(match, scopeTypeType, "iteration")!;
    const domain =
      getCaptureRange(match, [
        `${scopeTypeType}.iteration.domain`,
        `_.iteration.domain`,
      ]) ?? contentRange;

    return {
      editor,
      domain,
      getTarget: (isReversed) =>
        new PlainTarget({
          editor,
          isReversed,
          contentRange,
        }),
    };
  }
}

/**
 * Gets the range of a node that is related to the scope.  For example, if the
 * scope is "class name", the `domain` node would be the containing class.
 *
 * @param match The match to get the range from
 * @param scopeTypeType The type of the scope
 * @param relationship The relationship to get the range for, eg "domain", or "removal"
 * @returns A range or undefined if no range was found
 */
function getRelatedRange(
  match: QueryMatch,
  scopeTypeType: string,
  relationship: string,
) {
  return getCaptureRange(match, [
    `${scopeTypeType}.${relationship}`,
    `_.${relationship}`,
  ]);
}

function getCaptureRange(match: QueryMatch, names: string[]) {
  const relatedNode = match.captures.find((capture) =>
    names.some((name) => capture.name === name),
  )?.node;

  return relatedNode == null ? undefined : getNodeRange(relatedNode);
}

function positionToPoint(start: Position): Point | undefined {
  return { row: start.line, column: start.character };
}
