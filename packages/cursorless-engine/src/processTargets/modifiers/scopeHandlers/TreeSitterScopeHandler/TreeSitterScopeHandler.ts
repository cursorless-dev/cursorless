import { Range, SimpleScopeType, TextEditor } from "@cursorless/common";
import { TreeSitterQuery } from "../../../../languages/TreeSitterQuery";
import { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { ScopeTypeTarget } from "../../../targets/ScopeTypeTarget";
import { CustomScopeType } from "../scopeHandler.types";
import {
  BaseTreeSitterScopeHandler,
  ExtendedTargetScope,
} from "./BaseTreeSitterScopeHandler";
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
  ): ExtendedTargetScope | undefined {
    const scopeTypeType = this.scopeType.type;

    const capture = findCaptureByName(match, scopeTypeType);

    if (capture == null) {
      // This capture was for some unrelated scope type
      return undefined;
    }

    const { range: contentRange, allowMultiple, insertionDelimiters } = capture;

    const domain =
      getRelatedRange(match, scopeTypeType, "domain", true) ?? contentRange;

    const removalRange = getRelatedRange(match, scopeTypeType, "removal", true);

    const leadingDelimiterRange = dropEmptyRange(
      getRelatedRange(match, scopeTypeType, "leading", true),
    );

    const trailingDelimiterRange = dropEmptyRange(
      getRelatedRange(match, scopeTypeType, "trailing", true),
    );

    const interiorRange = getRelatedRange(
      match,
      scopeTypeType,
      "interior",
      true,
    );

    const delimiter = getInsertionDelimiter(editor, match, insertionDelimiters);

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
          removalRange,
          leadingDelimiterRange,
          trailingDelimiterRange,
          interiorRange,
          delimiter,
        }),
      ],
    };
  }
}

function getInsertionDelimiter(
  editor: TextEditor,
  match: QueryMatch,
  insertionDelimiters?: string[],
): string | undefined {
  if (insertionDelimiters == null) {
    return undefined;
  }

  for (const delimiter of insertionDelimiters) {
    if (!delimiter.startsWith("@")) {
      return delimiter;
    }

    const capture = findCaptureByName(match, delimiter.slice(1));
    if (capture != null) {
      const { range } = capture;
      if (!range.isEmpty) {
        return editor.document.getText(range);
      }
    }
  }

  return undefined;
}

function dropEmptyRange(range?: Range) {
  return range != null && !range.isEmpty ? range : undefined;
}
