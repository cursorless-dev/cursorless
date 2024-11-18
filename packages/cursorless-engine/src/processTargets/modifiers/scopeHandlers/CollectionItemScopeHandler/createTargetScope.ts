import { type TextEditor, Range } from "@cursorless/common";
import { getRangeLength } from "../../../../util/rangeUtils";
import { ScopeTypeTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";

export function createTargetScope(
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
  // The leading one is longer/more specific so prefer to use that for removal.
  const removalRange =
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
