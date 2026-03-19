import { invariant } from "immutability-helper";
import type {
  ChangeEventInfo,
  FullRangeInfo,
} from "../../typings/updateSelections";
import type { RangeOffsets } from "@cursorless/common";

/**
 * Gets updated offsets for the range `rangeInfo` after the change described by
 * `changeEventInfo`.  This function will only be called if the following hold:
 *
 * - the change is a delete or replace event, ie a change event for which the
 *   original range is nonempty, and
 * - the change's original range overlaps with or is directly adjacent to the
 *   range to be updated.
 *
 * There are many ways one might handle replaces and deletes.  We opt for a
 * relatively simple approach.  We attempt to keep both the start and end
 * offsets as close as possible to what they were prior to the change.  We
 * handle start and end offsets independently.  For each edge (start or end),
 * we move it to the left only if it was contained in the original range, and
 * it will now be to the right of the new range.  We just clamp it so that
 * it will match the end of the new change range in that case.
 *
 * @param changeEventInfo Information about the change that occurred
 * @param rangeInfo The range to compute new offsets for
 * @returns The new offsets for the given range
 */
export default function getOffsetsForDeleteOrReplace(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
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
    () => "Change range expected to be nonempty",
  );
  invariant(
    changeOriginalEndOffset >= rangeStart &&
      changeOriginalStartOffset <= rangeEnd,
    () => "Change range expected to intersect with selection range",
  );

  return {
    start:
      changeOriginalEndOffset <= rangeStart
        ? rangeStart + displacement
        : Math.min(rangeStart, changeFinalEndOffset),
    end:
      changeOriginalEndOffset <= rangeEnd
        ? rangeEnd + displacement
        : Math.min(rangeEnd, changeFinalEndOffset),
  };
}
