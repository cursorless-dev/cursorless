import { invariant } from "immutability-helper";
import {
  ChangeEventInfo,
  FullRangeInfo,
  RangeOffsets,
} from "../../typings/updateSelections";

export function getOffsetsForDeleteOrReplace(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo
): RangeOffsets {
  const {
    originalOffsets: {
      start: changeOriginalStartOffset,
      end: changeOriginalEndOffset,
    },
    finalOffsets: { end: changeFinalEndOffset },
    displacement,
  } = changeEventInfo;
  const {
    offsets: { start: rangeStart, end: rangeEnd },
  } = rangeInfo;

  invariant(
    changeOriginalEndOffset > changeOriginalStartOffset,
    () => "Change range expected to be nonempty"
  );
  invariant(
    changeOriginalEndOffset >= rangeStart &&
      changeOriginalStartOffset <= rangeEnd,
    () => "Change range expected to intersect with selection range"
  );

  return {
    start: Math.min(rangeStart, changeFinalEndOffset),
    end:
      changeOriginalStartOffset < rangeEnd
        ? rangeEnd + displacement
        : Math.min(rangeEnd, changeFinalEndOffset),
  };
}
