import type { SimpleScopeType, TextEditor } from "@cursorless/common";
import type { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import type { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { ScopeTypeTarget } from "../../../targets/ScopeTypeTarget";
import type { CustomScopeType } from "../scopeHandler.types";
import { getCollectionItemRemovalRange } from "../util/getCollectionItemRemovalRange";
import type { ExtendedTargetScope } from "./BaseTreeSitterScopeHandler";
import { BaseTreeSitterScopeHandler } from "./BaseTreeSitterScopeHandler";
import { TreeSitterIterationScopeHandler } from "./TreeSitterIterationScopeHandler";
import { findCaptureByName, getRelatedRange } from "./captureUtils";

/**
 * Handles scopes that are implemented using tree-sitter.
 */
export class TreeSitterScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;

  constructor(
    query: TreeSitterQuery,
    public scopeType: SimpleScopeType,
  ) {
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
    isEveryScope: boolean,
  ): ExtendedTargetScope | undefined {
    const scopeTypeType = this.scopeType.type;

    const capture = findCaptureByName(match, scopeTypeType);

    if (capture == null) {
      // This capture was for some unrelated scope type
      return undefined;
    }

    const { range: contentRange, allowMultiple, insertionDelimiter } = capture;

    const domain =
      getRelatedRange(match, scopeTypeType, "domain", true) ?? contentRange;

    const prefixRange = getRelatedRange(
      match,
      scopeTypeType,
      "prefix",
      true,
    )?.with(undefined, contentRange.start);

    const leadingDelimiterRange = getRelatedRange(
      match,
      scopeTypeType,
      "leading",
      true,
    )?.with(undefined, prefixRange?.start ?? contentRange.start);

    const trailingDelimiterRange = getRelatedRange(
      match,
      scopeTypeType,
      "trailing",
      true,
    )?.with(contentRange.end);

    let removalRange = getRelatedRange(match, scopeTypeType, "removal", true);

    if (
      removalRange == null &&
      (scopeTypeType === "collectionItem" ||
        scopeTypeType === "argumentOrParameter")
    ) {
      removalRange = getCollectionItemRemovalRange(
        isEveryScope,
        editor,
        contentRange,
        leadingDelimiterRange,
        trailingDelimiterRange,
      );
    }

    return {
      editor,
      domain,
      allowMultiple,
      getTargets: (isReversed) => [
        new ScopeTypeTarget({
          scopeTypeType,
          editor,
          isReversed,
          contentRange,
          prefixRange,
          removalRange,
          leadingDelimiterRange,
          trailingDelimiterRange,
          insertionDelimiter,
        }),
      ],
    };
  }
}
