import { type TextEditor, Range } from "@cursorless/common";
import { ScopeTypeTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";
import { getCollectionItemRemovalRange } from "../util/getCollectionItemRemovalRange";

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

  const removalRange = getCollectionItemRemovalRange(
    isEveryScope,
    editor,
    contentRange,
    leadingDelimiterRange,
    trailingDelimiterRange,
  );

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
