import { SimpleScopeType, TextEditor } from "@cursorless/common";

import { Query, QueryMatch } from "web-tree-sitter";
import { TreeSitter } from "../../../..";
import ScopeTypeTarget from "../../../targets/ScopeTypeTarget";
import { TargetScope } from "../scope.types";
import { CustomScopeType } from "../scopeHandler.types";
import { BaseTreeSitterScopeHandler } from "./BaseTreeSitterScopeHandler";
import { TreeSitterIterationScopeHandler } from "./TreeSitterIterationScopeHandler";
import {
  getCaptureRangeByName,
  getRelatedRange,
} from "./getCaptureRangeByName";

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export class TreeSitterScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;

  constructor(
    treeSitter: TreeSitter,
    query: Query,
    public scopeType: SimpleScopeType,
  ) {
    super(treeSitter, query);
  }

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

  protected matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): TargetScope | undefined {
    const scopeTypeType = this.scopeType.type;

    const contentRange = getCaptureRangeByName(match, scopeTypeType);

    if (contentRange == null) {
      return undefined;
    }

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
