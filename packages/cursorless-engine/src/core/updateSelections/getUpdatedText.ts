import type {
  ChangeEventInfo,
  FullRangeInfo,
} from "../../typings/updateSelections";
import type { RangeOffsets } from "@cursorless/common";

/**
 * Updates the text of the given rangeInfo to take into account the given change.
 *
 * The process is to first include any text from the original range that is
 * before the range of the change, then add the text of the change, then add any
 * text that trails the original change range.  Then we take a substring
 * corresponding to the range's new offsets.
 *
 * @param changeEventInfo The change to incorporate
 * @param rangeInfo The rangeInfo to update
 * @param newOffsets The new offsets that the rangeInfo will have
 * @returns The new text of the range
 */
export function getUpdatedText(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
  newOffsets: RangeOffsets,
): string {
  const { start: changeOriginalOffsetsStart, end: changeOriginalOffsetsEnd } =
    changeEventInfo.originalOffsets;
  const { start: rangeOriginalOffsetsStart, end: rangeOriginalOffsetsEnd } =
    rangeInfo.offsets;

  const newTextStartOffset = Math.min(
    changeOriginalOffsetsStart,
    rangeOriginalOffsetsStart,
  );

  let result = "";

  // First add any text from the range before the start of the change range
  if (rangeOriginalOffsetsStart < changeOriginalOffsetsStart) {
    result += rangeInfo.text.substring(
      0,
      changeOriginalOffsetsStart - rangeOriginalOffsetsStart,
    );
  }

  // Then add the text of the change
  result += changeEventInfo.event.text;

  // Then add any text that was after the original change range
  if (changeOriginalOffsetsEnd < rangeOriginalOffsetsEnd) {
    result += rangeInfo.text.substring(
      rangeOriginalOffsetsEnd - changeOriginalOffsetsEnd,
      rangeInfo.text.length,
    );
  }

  // Then take a substring based on the range's new offsets
  return result.substring(
    newOffsets.start - newTextStartOffset,
    newOffsets.end - newTextStartOffset,
  );
}
