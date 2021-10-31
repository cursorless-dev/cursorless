import { sumBy } from "lodash";
import { getOffsetsForDeleteOrReplace } from "./getOffsetsForDeleteOrReplace";
import { getOffsetsForEmptyRangeInsert } from "./getOffsetsForEmptyRangeInsert";
import { getOffsetsForNonEmptyRangeInsert } from "./getOffsetsForNonEmptyRangeInsert";
import {
  ExtendedTextDocumentChangeEvent,
  FullRangeInfo,
  ChangeEventInfo,
  RangeOffsets,
} from "../../typings/updateSelections";
import { getUpdatedText } from "./getUpdatedText";

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

    const displacements = changeEventInfos.map((changeEventInfo) => {
      let newOffsets: RangeOffsets;

      if (changeEventInfo.originalOffsets.start > originalOffsets.end) {
        return {
          start: 0,
          end: 0,
        };
      }

      if (changeEventInfo.originalOffsets.end < originalOffsets.start) {
        return {
          start: changeEventInfo.displacement,
          end: changeEventInfo.displacement,
        };
      }

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
      }

      rangeInfo.text = getUpdatedText(changeEventInfo, rangeInfo, newOffsets);

      return {
        start: newOffsets.start - originalOffsets.start,
        end: newOffsets.end - originalOffsets.end,
      };
    });

    const newOffsets = {
      start: originalOffsets.start + sumBy(displacements, ({ start }) => start),
      end: originalOffsets.end + sumBy(displacements, ({ end }) => end),
    };

    rangeInfo.range = rangeInfo.range.with(
      document.positionAt(newOffsets.start),
      document.positionAt(newOffsets.end)
    );
    rangeInfo.offsets = newOffsets;
  }
}
