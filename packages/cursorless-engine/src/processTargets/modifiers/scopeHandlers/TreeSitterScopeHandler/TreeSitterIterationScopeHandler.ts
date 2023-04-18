import {
  ScopeType,
  SimpleScopeType, TextEditor
} from "@cursorless/common";
import { Query, QueryMatch } from "web-tree-sitter";
import { TreeSitter } from "../../../..";
import { PlainTarget } from "../../../targets";
import { TargetScope } from "../scope.types";
import { BaseTreeSitterScopeHandler } from "./BaseTreeSitterScopeHandler";
import { getRelatedRange, getCaptureRangeByName } from "./getCaptureRangeByName";


export class TreeSitterIterationScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;
  public scopeType = undefined;

  public get iterationScopeType(): ScopeType {
    throw Error("Not implemented");
  }

  constructor(
    treeSitter: TreeSitter,
    query: Query,
    private iterateeScopeType: SimpleScopeType
  ) {
    super(treeSitter, query);
  }

  protected matchToScope(
    editor: TextEditor,
    match: QueryMatch
  ): TargetScope | undefined {
    const scopeTypeType = this.iterateeScopeType.type;

    const contentRange = getRelatedRange(match, scopeTypeType, "iteration")!;

    if (contentRange == null) {
      return undefined;
    }

    const domain = getCaptureRangeByName(
      match,
      `${scopeTypeType}.iteration.domain`,
      `_.iteration.domain`
    ) ?? contentRange;

    return {
      editor,
      domain,
      getTarget: (isReversed) => new PlainTarget({
        editor,
        isReversed,
        contentRange,
      }),
    };
  }
}
