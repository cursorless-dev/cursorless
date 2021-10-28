import { invariant } from "immutability-helper";
import { leftAnchored, rightAnchored } from "../../util/regex";
import {
  ChangeEventInfo,
  FullRangeInfo,
  RangeOffsets,
} from "../../typings/updateSelections";

export function getOffsetsForNonEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo
): RangeOffsets {
  const {
    event: { text: insertedText, isReplace },
    originalOffsets: { start: insertOffset },
    displacement,
  } = changeEventInfo;
  const {
    offsets: { start: rangeStart, end: rangeEnd },
    text: originalRangeText,
  } = rangeInfo;

  invariant(
    rangeEnd > rangeStart,
    () => "Selection range expected to be nonempty"
  );
  invariant(
    insertOffset >= rangeStart && insertOffset <= rangeEnd,
    () => "Insertion offset expected to intersect with selection range"
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

      case "regex":
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

      case "regex":
        let text = originalRangeText + insertedText;
        const regex = leftAnchored(expansionBehavior.regex);
        let matches = text.match(regex);
        let matchLength = matches == null ? 0 : matches[0].length;
        while (matchLength !== 0 && matchLength < originalRangeText.length) {
          // If the original range contains multiple matching instances of the regex use the leftmost one
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
