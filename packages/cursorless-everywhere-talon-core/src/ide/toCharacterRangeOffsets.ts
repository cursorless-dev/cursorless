import type { GeneralizedRange, TextEditor } from "@cursorless/common";
import type { RangeOffsets } from "../types/types";

export function toCharacterRangeOffsets(
  editor: TextEditor,
  range: GeneralizedRange,
): RangeOffsets {
  if (range.type === "line") {
    const startLine = editor.document.lineAt(range.start).range;
    const endLine = editor.document.lineAt(range.end).range;
    return {
      start: editor.document.offsetAt(startLine.start),
      end: editor.document.offsetAt(endLine.end),
    };
  }
  return {
    start: editor.document.offsetAt(range.start),
    end: editor.document.offsetAt(range.end),
  };
}
