import { invariant } from "immutability-helper";
import { leftAnchored, rightAnchored } from "../../util/regex";
import {
  ChangeEventInfo,
  FullRangeInfo,
  RangeOffsets,
} from "../../typings/updateSelections";

export function getOffsetsForEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo
): RangeOffsets {
  const {
    event: { text, isReplace },
    finalOffsets: { start, end },
  } = changeEventInfo;

  invariant(
    start === changeEventInfo.originalOffsets.end &&
      start === rangeInfo.offsets.start &&
      start === rangeInfo.offsets.end,
    () => "Selection range and change range expected to be same empty range"
  );

  if (isReplace) {
    // In this case the cursor stays to the left so we care about the start of the range
    const expansionBehavior = rangeInfo.expansionBehavior.start;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start: end,
          end,
        };

      case "open":
        return { start, end };

      case "regex":
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
  } else {
    // In this case the cursor moves to the right so we care about the end of the range
    const expansionBehavior = rangeInfo.expansionBehavior.end;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start,
          end: start,
        };

      case "open":
        return { start, end };

      case "regex":
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
}
