import type {
  GeneralizedRange,
  LineRange,
  TextEditor,
} from "@cursorless/common";
import type { Talon } from "../types/talon.types";
import type { CharacterRangeOffsets } from "../types/types";

export function setHighlightRanges(
  talon: Talon,
  editor: TextEditor,
  ranges: GeneralizedRange[],
  highlightId: string | undefined,
): Promise<void> {
  const offsetRanges = ranges.map(
    (range): CharacterRangeOffsets | LineRange => {
      if (range.type === "line") {
        return range;
      }
      return {
        type: "character",
        start: editor.document.offsetAt(range.start),
        end: editor.document.offsetAt(range.end),
      };
    },
  );

  talon.actions.user.cursorless_everywhere_set_highlight_ranges(
    offsetRanges,
    highlightId,
  );

  return Promise.resolve();
}
