import {
  ChangeEventInfo,
  FullRangeInfo,
  RangeOffsets,
} from "../../typings/updateSelections";

export function getUpdatedText(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
  newOffsets: RangeOffsets
): string {
  const { start: changeOriginalOffsetsStart, end: changeOriginalOffsetsEnd } =
    changeEventInfo.originalOffsets;
  const { start: rangeOriginalOffsetsStart, end: rangeOriginalOffsetsEnd } =
    rangeInfo.offsets;
  const newTextStartOffset = Math.min(
    changeOriginalOffsetsStart,
    rangeOriginalOffsetsStart
  );

  let result = "";

  if (rangeOriginalOffsetsStart < changeOriginalOffsetsStart) {
    result += rangeInfo.text.substring(
      0,
      changeOriginalOffsetsStart - rangeOriginalOffsetsStart
    );
  }

  result += changeEventInfo.event.text;

  if (changeOriginalOffsetsEnd < rangeOriginalOffsetsEnd) {
    result += rangeInfo.text.substring(
      rangeOriginalOffsetsEnd - changeOriginalOffsetsEnd,
      rangeInfo.text.length
    );
  }

  return result.substring(
    newOffsets.start - newTextStartOffset,
    newOffsets.end - newTextStartOffset
  );
}
