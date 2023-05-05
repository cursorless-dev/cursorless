import { ScopeType, TextEditor } from "@cursorless/common";
import { QueryMatch } from "web-tree-sitter";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { TEXT_FRAGMENT_CAPTURE_NAME } from "../../../../languages/captureNames";
import { PlainTarget } from "../../../targets";
import { TargetScope } from "../scope.types";
import { BaseTreeSitterScopeHandler } from "./BaseTreeSitterScopeHandler";
import { getCaptureRangeByName } from "./captureUtils";

/** Scope handler to be used for extracting text fragments from the perspective
 * of surrounding pairs */
export class TreeSitterTextFragmentScopeHandler extends BaseTreeSitterScopeHandler {
  protected isHierarchical = true;

  // Doesn't correspond to any scope type
  public scopeType = undefined;

  // Doesn't have any iteration scope type itself; that would correspond to
  // something like "every every"
  public get iterationScopeType(): ScopeType {
    throw Error("Not implemented");
  }

  constructor(query: TreeSitterQuery) {
    super(query);
  }

  protected matchToScope(
    editor: TextEditor,
    match: QueryMatch,
  ): TargetScope | undefined {
    const contentRange = getCaptureRangeByName(
      match,
      TEXT_FRAGMENT_CAPTURE_NAME,
    );

    if (contentRange == null) {
      // This capture was for some unrelated scope type
      return undefined;
    }

    return {
      editor,
      domain: contentRange,
      getTarget: (isReversed) =>
        new PlainTarget({
          editor,
          isReversed,
          contentRange,
        }),
    };
  }
}
