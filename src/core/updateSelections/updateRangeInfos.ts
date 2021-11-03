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
interface ExpansionInfo {
  edgeOfSurvivingRange: number;
  interiorEdgeOfCandidateRange: number;
  exteriorEdgeOfCandidateRange: number;
  totalDisplacement: number;
}

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
    let endExpansionInfo: ExpansionInfo | null = null;
    let startExpansionInfo: ExpansionInfo | null = null;

    // Note that VSCode gives us the list of changes in an order that is in
    // reverse document order.  If two edits occur at the same location, it
    // will give us the edits in the reverse order in which the edits were
    // created in an editBuilder, so that if we were to apply the edits one
    // after the other, the first edit would appear first in the new document.
    changeEventInfos.forEach((changeEventInfo, index) => {
      const {
        displacement,
        event: change,
        originalOffsets: {
          start: changeOriginalStartOffset,
          end: changeOriginalEndOffset,
        },
        finalOffsets: {
          start: changeFinalStartOffset,
          end: changeFinalEndOffset,
        },
      } = changeEventInfo;

      if (endExpansionInfo != null) {
        endExpansionInfo.totalDisplacement += displacement;
      }

      if (startExpansionInfo != null) {
        startExpansionInfo.totalDisplacement += displacement;
      }

      // Easy case 1: edit occurred strictly after the range; nothing to do
      if (changeOriginalStartOffset > rangeInfo.offsets.end) {
        return;
      }

      // Easy case 2: edit occurred strictly before the range; just shift start
      // and end of range as necessary to accommodate displacement from edit.
      if (changeOriginalEndOffset < rangeInfo.offsets.start) {
        rangeInfo.offsets.start += displacement;
        rangeInfo.offsets.end += displacement;

        return;
      }

      // Handle the hard cases
      if (
        rangeInfo.expansionBehavior.end.type === "regex" &&
        changeOriginalStartOffset <= rangeInfo.offsets.end &&
        changeOriginalEndOffset >= rangeInfo.offsets.end
      ) {
        let startChange = changeEventInfo;
        let nextIndex = index - 1;
        let nextChange: ChangeEventInfo;

        while (true) {
          nextChange = changeEventInfos[nextIndex];
          if (
            nextChange == null ||
            nextChange.originalOffsets.end < startChange.originalOffsets.start
          ) {
            break;
          }
          startChange = nextChange;
          nextIndex--;
        }

        endExpansionInfo = {
          edgeOfSurvivingRange: Math.max(
            rangeInfo.offsets.start,
            nextChange == null ? 0 : nextChange.originalOffsets.end
          ),
        };
      } else if (changeEventInfo.event.rangeLength === 0) {
        if (rangeInfo.range.isEmpty) {
          rangeInfo.offsets = getOffsetsForEmptyRangeInsert(
            changeEventInfo,
            rangeInfo
          );
        } else {
          rangeInfo.offsets = getOffsetsForNonEmptyRangeInsert(
            changeEventInfo,
            rangeInfo
          );
        }
      } else {
        rangeInfo.offsets = getOffsetsForDeleteOrReplace(
          changeEventInfo,
          rangeInfo
        );

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
  }
}
