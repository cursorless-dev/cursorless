import { type TextEditor, Range } from "@cursorless/common";
import { getRangeLength } from "../../../../util/rangeUtils";
import { ScopeTypeTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";

export function createTargetScope(
  isEveryScope: boolean,
  editor: TextEditor,
  iterationRange: Range,
  contentRange: Range,
  previousRange?: Range,
  nextRange?: Range,
): TargetScope {
  const leadingDelimiterRange =
    previousRange != null
      ? new Range(previousRange.end, contentRange.start)
      : undefined;
  const trailingDelimiterRange =
    nextRange != null
      ? new Range(contentRange.end, nextRange.start)
      : undefined;

  // We have both leading and trailing delimiter ranges
  // If the leading one is longer/more specific, prefer to use that for removal;
  // otherwise use undefined to fallback to the default behavior (often trailing)
  const removalRange =
    !isEveryScope &&
    leadingDelimiterRange != null &&
    trailingDelimiterRange != null &&
    getRangeLength(editor, leadingDelimiterRange) >
      getRangeLength(editor, trailingDelimiterRange)
      ? contentRange.union(leadingDelimiterRange)
      : undefined;

  const insertionDelimiter = iterationRange.isSingleLine ? ", " : ",\n";

  return {
    editor,
    domain: contentRange,
    getTargets(isReversed) {
      return [
        new ScopeTypeTarget({
          scopeTypeType: "collectionItem",
          editor,
          isReversed,
          contentRange,
          insertionDelimiter,
          leadingDelimiterRange,
          trailingDelimiterRange,
          removalRange,
        }),
      ];
    },
  };
}
