import { sumBy } from "lodash";
import getOffsetsForDeleteOrReplace from "./getOffsetsForDeleteOrReplace";
import getOffsetsForEmptyRangeInsert from "./getOffsetsForEmptyRangeInsert";
import getOffsetsForNonEmptyRangeInsert from "./getOffsetsForNonEmptyRangeInsert";
import {
  ExtendedTextDocumentChangeEvent,
  FullRangeInfo,
  ChangeEventInfo,
  RangeOffsets,
} from "../../typings/updateSelections";
import { getUpdatedText } from "./getUpdatedText";

/**
 * Iterates through the given range infos and updates them to take into account
 * the given changes.
 *
 * For a given range / change pair, if the given change original range doesn't
 * overlap with and is not adjacent to the range to update, the range will just
 * be shifted as necessary if it is after the change range.
 *
 * For a range / change pair that are adjacent or have some overlap, delegate
 * to the functions `getOffsetsForDeleteOrReplace`,
 * `getOffsetsForEmptyRangeInsert`, and `getOffsetsForNonEmptyRangeInsert`.
 * See their documentation for information about how these cases are handled.
 *
 * @param changeEvent Information about the change that occurred
 * @param rangeInfoGenerator A generator yielding `FullRangeInfo`s to update
 */
export function updateRangeInfos(
  changeEvent: ExtendedTextDocumentChangeEvent,
  rangeInfoGenerator: Generator<FullRangeInfo, void, unknown>
) {
  const { document, contentChanges } = changeEvent;

  const changeEventInfos: ChangeEventInfo[] = contentChanges.map((change) => {
    const changeDisplacement = change.text.length - change.rangeLength;
    const changeOriginalStartOffset = change.rangeOffset;
    const changeOriginalEndOffset =
      changeOriginalStartOffset + change.rangeLength;
    const changeFinalStartOffset = changeOriginalStartOffset;
    const changeFinalEndOffset = changeOriginalEndOffset + changeDisplacement;

    return {
      displacement: changeDisplacement,
      event: change,
      originalOffsets: {
        start: changeOriginalStartOffset,
        end: changeOriginalEndOffset,
      },
      finalOffsets: {
        start: changeFinalStartOffset,
        end: changeFinalEndOffset,
      },
    };
  });

  for (const rangeInfo of rangeInfoGenerator) {
    const originalOffsets = rangeInfo.offsets;
    let needsRegexAdjustment = false;
    const hasRegexEdge =
      rangeInfo.expansionBehavior.start.type === "regex" ||
      rangeInfo.expansionBehavior.end.type === "regex";

    /**
     * The offsets that haven't been eaten into by any replace or delete that
     * extends past the end of the original range.
     */
    let survivingOffsets = originalOffsets;

    // NB: We just collect displacements for both ends of the range and then
    // add them up after we've processed all changes.  This way we can treat
    // the changes completely independently.
    //
    // Note that VSCode gives us the list of changes in an order that is in
    // reverse document order.  If two edits occur at the same location, it
    // will give us the edits in the reverse order in which the edits were
    // created in an editBuilder, so that if we were to apply the edits one
    // after the other, the first edit would appear first in the new document.
    const displacements = changeEventInfos.map((changeEventInfo) => {
      // Easy case 1: edit occurred strictly after the range; nothing to do
      if (changeEventInfo.originalOffsets.start > originalOffsets.end) {
        return {
          start: 0,
          end: 0,
        };
      }

      // Easy case 2: edit occurred strictly before the range; just shift start
      // and end of range as necessary to accommodate displacement from edit.
      if (changeEventInfo.originalOffsets.end < originalOffsets.start) {
        return {
          start: changeEventInfo.displacement,
          end: changeEventInfo.displacement,
        };
      }

      // Handle the hard cases
      let newOffsets: RangeOffsets;

      // Indicate that we need to see if regex expansion needs to occur
      needsRegexAdjustment = true;

      if (changeEventInfo.event.rangeLength === 0) {
        if (rangeInfo.range.isEmpty) {
          newOffsets = getOffsetsForEmptyRangeInsert(
            changeEventInfo,
            rangeInfo
          );
        } else {
          newOffsets = getOffsetsForNonEmptyRangeInsert(
            changeEventInfo,
            rangeInfo
          );
        }
      } else {
        newOffsets = getOffsetsForDeleteOrReplace(changeEventInfo, rangeInfo);

        if (hasRegexEdge) {
          const {
            originalOffsets: {
              start: changeOriginalStartOffset,
              end: changeOriginalEndOffset,
            },
          } = changeEventInfo;

          survivingOffsets = {
            end:
              changeOriginalEndOffset >= survivingOffsets.end
                ? Math.min(survivingOffsets.end, changeOriginalStartOffset)
                : survivingOffsets.end,
            start:
              changeOriginalStartOffset <= survivingOffsets.start
                ? Math.max(survivingOffsets.start, changeOriginalEndOffset)
                : survivingOffsets.start,
          };
        }
      }

      // Update the text field to match what it will actually be after the
      // given edit.  We use this text field when doing regex-based expansion.
      rangeInfo.text = getUpdatedText(changeEventInfo, rangeInfo, newOffsets);

      // Convert to displacements rather than document offsets
      return {
        start: newOffsets.start - originalOffsets.start,
        end: newOffsets.end - originalOffsets.end,
      };
    });

    const totalDisplacements = {
      start: sumBy(displacements, ({ start }) => start),
      end: sumBy(displacements, ({ end }) => end),
    };

    // Add up all the displacements
    let newOffsets = {
      start: originalOffsets.start + totalDisplacements.start,
      end: originalOffsets.end + totalDisplacements.end,
    };

    if (hasRegexEdge && survivingOffsets.end > survivingOffsets.start) {
      survivingOffsets = {
        start: survivingOffsets.start + totalDisplacements.start,
        end: survivingOffsets.end + totalDisplacements.end,
      };

      newOffsets = {
        start:
          rangeInfo.expansionBehavior.start.type === "regex"
            ? expandStartByRegex(
                document,
                survivingOffsets,
                rangeInfo.expansionBehavior.start.regex
              )
            : newOffsets.start,
        end:
          rangeInfo.expansionBehavior.end.type === "regex"
            ? expandEndByRegex(
                document,
                survivingOffsets,
                rangeInfo.expansionBehavior.end.regex
              )
            : newOffsets.end,
      };
    }

    // Do final range and offset update
    rangeInfo.range = rangeInfo.range.with(
      document.positionAt(newOffsets.start),
      document.positionAt(newOffsets.end)
    );
    rangeInfo.offsets = newOffsets;
  }
}
