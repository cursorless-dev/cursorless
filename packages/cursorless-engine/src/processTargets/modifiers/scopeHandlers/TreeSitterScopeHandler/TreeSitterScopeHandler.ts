import { SimpleScopeType, TextEditor } from "@cursorless/common";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import ScopeTypeTarget from "../../../targets/ScopeTypeTarget";
import { TargetScope } from "../scope.types";
import { CustomScopeType } from "../scopeHandler.types";
import { BaseTreeSitterScopeHandler } from "./BaseTreeSitterScopeHandler";
import { TreeSitterIterationScopeHandler } from "./TreeSitterIterationScopeHandler";
import { getCaptureRangeByName, getRelatedRange } from "./captureUtils";

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export class TreeSitterScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;

  constructor(query: TreeSitterQuery, public scopeType: SimpleScopeType) {
    super(query);
  }

  // We just create a custom scope handler that doesn't necessarily correspond
  // to any well-defined scope type
  public get iterationScopeType(): CustomScopeType {
    return {
      type: "custom",
      scopeHandler: new TreeSitterIterationScopeHandler(
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
      // This capture was for some unrelated scope type
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
      getTargets: (isReversed) => [
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
      ],
    };
  }
}
