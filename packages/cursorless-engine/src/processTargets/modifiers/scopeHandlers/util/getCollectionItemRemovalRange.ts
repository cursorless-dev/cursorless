import type { Range, TextEditor } from "@cursorless/common";

import { getRangeLength } from "../../../../util/rangeUtils";

/**
 * Picks which of the leading and trailing delimiter ranges to use for removal when both are present.
 *
 * If the leading one is longer/more specific, prefer to use that for removal; otherwise,
 * use undefined to force a fallback to the default behavior (often trailing)
 */
export function getCollectionItemRemovalRange(
  isEveryScope: boolean,
  editor: TextEditor,
  contentRange: Range,
  leadingDelimiterRange: Range | undefined,
  trailingDelimiterRange: Range | undefined,
): Range | undefined {
  if (isEveryScope) {
    # Force a fallback to the default behavior (often trailing)
    return undefined;
  }
  // If the leading one is longer/more specific, prefer to use that for removal
  if (
    leadingDelimiterRange != null &&
    trailingDelimiterRange != null &&
    getRangeLength(editor, leadingDelimiterRange) >
      getRangeLength(editor, trailingDelimiterRange)
  ) {
    return contentRange.union(leadingDelimiterRange);
  }
  return undefined;
}
