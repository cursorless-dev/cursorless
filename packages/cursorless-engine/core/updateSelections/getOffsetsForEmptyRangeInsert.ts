import { invariant } from "immutability-helper";
import { leftAnchored, rightAnchored } from "../../util/regex";
import { ChangeEventInfo, FullRangeInfo } from "../../typings/updateSelections";
import { RangeOffsets } from "@cursorless/common";

/**
 * Gets updated offsets for the range `rangeInfo` after the change described by
 * `changeEventInfo`.  This function will only be called if the following hold:
 *
 * - the change is an insert event, ie a change event for which the
 *   original range is empty, and
 * - the range to be updated is empty, and
 * - the insertion position is equal to the position of the empty range to be
 *   updated.
 *
 * The approach taken here is to first look at the `isReplace` field of the
 * change to determine whether it should shift empty ranges to the right.  If
 * it shifts them to the right, we then look at its left / start expansion
 * behaviour.  If does not shift empty ranges, then we look at its right / end
 * expansion behaviour.
 *
 * If the given expansion behaviour is "open", we expand to contain the new
 * text, if "closed" we do not expand, and if "regex", we expand to contain as
 * much of the inserted text as matches the given regex, anchored at the
 * opposite end.
 *
 * @param changeEventInfo Information about the change that occurred
 * @param rangeInfo The range to compute new offsets for
 * @returns The new offsets for the given range
 */
export default function getOffsetsForEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
): RangeOffsets {
  const {
    event: { text, isReplace },
    finalOffsets: { start, end },
  } = changeEventInfo;

  invariant(
    start === changeEventInfo.originalOffsets.end &&
      start === rangeInfo.offsets.start &&
      start === rangeInfo.offsets.end,
    () => "Selection range and change range expected to be same empty range",
  );

  if (isReplace) {
    // In this case the range stays to the left so we care about the end of the range
    const expansionBehavior = rangeInfo.expansionBehavior.end;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start,
          end: start,
        };

      case "open":
        return { start, end };

      case "regex": {
        const matches = text.match(leftAnchored(expansionBehavior.regex));

        return matches == null
          ? {
              start,
              end: start,
            }
          : {
              start,
              end: start + matches[0].length,
            };
      }
    }
  } else {
    // In this case the range moves to the right so we care about the start of the range
    const expansionBehavior = rangeInfo.expansionBehavior.start;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start: end,
          end,
        };

      case "open":
        return { start, end };

      case "regex": {
        const index = text.search(rightAnchored(expansionBehavior.regex));

        return index === -1
          ? {
              start: end,
              end,
            }
          : {
              start: start + index,
              end,
            };
      }
    }
  }
}
