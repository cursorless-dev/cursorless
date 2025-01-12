import type { GeneralizedRange, TextEditor } from "@cursorless/common";
import type { GeneralizedRangeOffsets } from "../types/types";

export function toGeneralizedRangeOffsets(
  editor: TextEditor,
  range: GeneralizedRange,
): GeneralizedRangeOffsets {
  if (range.type === "line") {
    return range;
  }
  return {
    type: "character",
    start: editor.document.offsetAt(range.start),
    end: editor.document.offsetAt(range.end),
  };
}
