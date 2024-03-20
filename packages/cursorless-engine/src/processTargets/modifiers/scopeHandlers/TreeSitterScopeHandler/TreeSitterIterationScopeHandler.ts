import { ScopeType, SimpleScopeType, TextEditor } from "@cursorless/common";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { PlainTarget } from "../../../targets";
import {
  BaseTreeSitterScopeHandler,
  ExtendedTargetScope,
} from "./BaseTreeSitterScopeHandler";
import { getRelatedCapture, getRelatedRange } from "./captureUtils";

/** Scope handler to be used for iteration scopes of tree-sitter scope types */
export class TreeSitterIterationScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;

  // Doesn't correspond to any scope type
  public scopeType = undefined;

  // Doesn't have any iteration scope type itself; that would correspond to
  // something like "every every"
  public get iterationScopeType(): ScopeType {
    throw Error("Not implemented");
  }

  constructor(
    query: TreeSitterQuery,
    /** The scope type for which we are the iteration scope */
    private iterateeScopeType: SimpleScopeType,
  ) {
    super(query);
  }

  protected matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): ExtendedTargetScope | undefined {
    const scopeTypeType = this.iterateeScopeType.type;

    const capture = getRelatedCapture(match, scopeTypeType, "iteration", false);

    if (capture == null) {
      // This capture was for some unrelated scope type
      return undefined;
    }

    const { range: contentRange, allowMultiple, contiguous } = capture;

    const domain =
      getRelatedRange(match, scopeTypeType, "iteration.domain", false) ??
      contentRange;

    return {
      editor,
      domain,
      allowMultiple,
      contiguous,
      getTargets: (isReversed) => [
        new PlainTarget({
          editor,
          isReversed,
          contentRange,
        }),
      ],
    };
  }
}
