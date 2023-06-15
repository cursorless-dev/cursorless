import { ScopeType, TextEditor } from "@cursorless/common";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { TEXT_FRAGMENT_CAPTURE_NAME } from "../../../../languages/captureNames";
import { PlainTarget } from "../../../targets";
import {
  BaseTreeSitterScopeHandler,
  ExtendedTargetScope,
} from "./BaseTreeSitterScopeHandler";
import { findCaptureByName } from "./captureUtils";

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
  ): ExtendedTargetScope | undefined {
    const capture = findCaptureByName(match, TEXT_FRAGMENT_CAPTURE_NAME);

    if (capture == null) {
      // This capture was for some unrelated scope type
      return undefined;
    }

    const { range: contentRange, allowMultiple } = capture;

    if (allowMultiple) {
      throw Error(
        "The #allow-multiple! predicate is not supported for text fragments",
      );
    }

    return {
      editor,
      domain: contentRange,
      allowMultiple,
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
