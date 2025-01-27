import type { Range, TextEditor } from "@cursorless/common";

import { getRangeLength } from "../../../../util/rangeUtils";

export function getCollectionItemRemovalRange(
  isEveryScope: boolean,
  editor: TextEditor,
  contentRange: Range,
  leadingDelimiterRange: Range | undefined,
  trailingDelimiterRange: Range | undefined,
): Range | undefined {
  // We have both leading and trailing delimiter ranges
  // If the leading one is longer/more specific, prefer to use that for removal;
  // otherwise use undefined to fallback to the default behavior (often trailing)
  return !isEveryScope &&
    leadingDelimiterRange != null &&
    trailingDelimiterRange != null &&
    getRangeLength(editor, leadingDelimiterRange) >
      getRangeLength(editor, trailingDelimiterRange)
    ? contentRange.union(leadingDelimiterRange)
    : undefined;
}
