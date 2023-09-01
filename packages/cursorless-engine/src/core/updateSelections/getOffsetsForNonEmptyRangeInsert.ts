import { invariant } from "immutability-helper";
import { leftAnchored, rightAnchored } from "../../util/regex";
import type {
  ChangeEventInfo,
  FullRangeInfo,
} from "../../typings/updateSelections";
import type { RangeOffsets } from "@cursorless/common";

/**
 * Gets updated offsets for the range `rangeInfo` after the change described by
 * `changeEventInfo`.  This function will only be called if the following hold:
 *
 * - the change is an insert event, ie a change event for which the
 *   original range is empty,
 * - the range to be updated is nonempty, and
 * - the insertion position is non-strictly contained by the range to be
 *   updated, ie inside the range or at its start or end.
 *
 * The approach taken here is to leave the selection unchanged in the case of
 * internal insertions (ie insertion position is strictly greater than start
 * and strictly less than end).  In that case, we just update the position of
 * the range end position to take into account the shift from the insertion.
 *
 * In the case of insertions that are at the beginning or end of the range, we
 * look at the `expansionBehavior` of the given end of the range.  If it is
 * "open", we expand to contain the new text, if "closed" we do not expand,
 * and if "regex" we anchor the regex at the other end of the range and see
 * how far it extends into the newly inserted text.
 *
 * @param changeEventInfo Information about the change that occurred
 * @param rangeInfo The range to compute new offsets for
 * @returns The new offsets for the given range
 */
export default function getOffsetsForNonEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
): RangeOffsets {
  const {
    event: { text: insertedText },
    originalOffsets: { start: insertOffset },
    displacement,
  } = changeEventInfo;
  const {
    offsets: { start: rangeStart, end: rangeEnd },
    text: originalRangeText,
  } = rangeInfo;

  invariant(
    rangeEnd > rangeStart,
    () => "Selection range expected to be nonempty",
  );
  invariant(
    insertOffset >= rangeStart && insertOffset <= rangeEnd,
    () => "Insertion offset expected to intersect with selection range",
  );

  if (insertOffset > rangeStart && insertOffset < rangeEnd) {
    // If containment is strict just move end of range to accommodate the internal change
    return { start: rangeStart, end: rangeEnd + displacement };
  }

  if (insertOffset === rangeStart) {
    const expansionBehavior = rangeInfo.expansionBehavior.start;
    const newRangeEnd = rangeEnd + displacement;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start: rangeStart + displacement,
          end: newRangeEnd,
        };

      case "open":
        return {
          start: rangeStart,
          end: newRangeEnd,
        };

      case "regex": {
        let text = insertedText + originalRangeText;
        const regex = rightAnchored(expansionBehavior.regex);
        let index = text.search(regex);
        while (index > insertedText.length) {
          // If the original range contains multiple matching instances of the regex use the leftmost one
          text = text.slice(0, index);
          index = text.search(regex);
        }

        return index === -1
          ? {
              start: rangeStart,
              end: newRangeEnd,
            }
          : {
              start: rangeStart + index,
              end: newRangeEnd,
            };
      }
    }
  } else {
    const expansionBehavior = rangeInfo.expansionBehavior.end;
    const newRangeStart = rangeStart;

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start: newRangeStart,
          end: rangeEnd,
        };

      case "open":
        return {
          start: newRangeStart,
          end: rangeEnd + displacement,
        };

      case "regex": {
        let text = originalRangeText + insertedText;
        const regex = leftAnchored(expansionBehavior.regex);
        let matches = text.match(regex);
        let matchLength = matches == null ? 0 : matches[0].length;
        while (matchLength !== 0 && matchLength < originalRangeText.length) {
          // If the original range contains multiple matching instances of the regex use the rightmost one
          text = originalRangeText.slice(matchLength) + insertedText;
          matches = text.match(regex);
          matchLength = matches == null ? 0 : matchLength + matches[0].length;
        }

        return matchLength === 0
          ? {
              start: newRangeStart,
              end: rangeEnd,
            }
          : {
              start: newRangeStart,
              end: rangeStart + matchLength,
            };
      }
    }
  }
}
