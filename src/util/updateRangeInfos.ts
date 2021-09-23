import {
  DecorationRangeBehavior,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "vscode";

export interface RangeInfo {
  document: TextDocument;
  range: Range;
  startOffset: number;
  endOffset: number;
}

interface ChangeEventInfo {
  event: TextDocumentContentChangeEvent;
  originalStartOffset: number;
  originalEndOffset: number;
  finalStartOffset: number;
  finalEndOffset: number;
  displacement: number;
}

interface RangeOffsets {
  startOffset: number;
  endOffset: number;
}

interface BehaviorCondition {
  isReplace?: boolean;

  isLeftOpen?: boolean;
  isRightOpen?: boolean;
  hasCaptureRegex?: boolean;
}

interface BehaviorDefinition {
  condition: BehaviorCondition;

  behavior: (
    changeEventInfo: ChangeEventInfo,
    rangeInfo: RangeInfo,
    options: { captureRegex: RegExp }
  ) => RangeOffsets;
}

interface InsertBehaviorCondition extends BehaviorCondition {
  isReplace: boolean;
}
interface InsertBehaviorDefinition extends BehaviorDefinition {
  condition: InsertBehaviorCondition;
}

const emptyRangeInsertBehaviors: InsertBehaviorDefinition[] = [
  {
    condition: { isReplace: false, isLeftOpen: false },
    behavior: ({ finalEndOffset }) => ({
      startOffset: finalEndOffset,
      endOffset: finalEndOffset,
    }),
  },
  {
    condition: { isReplace: false, isLeftOpen: true },
    behavior: ({ finalStartOffset, finalEndOffset }) => ({
      startOffset: finalStartOffset,
      endOffset: finalEndOffset,
    }),
  },
  {
    condition: { isReplace: false, hasCaptureRegex: true },
    behavior: (
      { finalStartOffset, finalEndOffset, event: { text } },
      _,
      { captureRegex }
    ) => {
      const { source, flags } = captureRegex;
      const newRegex = new RegExp(
        source.endsWith("$") ? source : source + "$",
        flags.replace("m", "")
      );

      const index = text.search(newRegex);

      return index === -1
        ? {
            startOffset: finalEndOffset,
            endOffset: finalEndOffset,
          }
        : {
            startOffset: finalStartOffset + index,
            endOffset: finalEndOffset,
          };
    },
  },
  {
    condition: { isReplace: true, isRightOpen: false },
    behavior: ({ finalStartOffset }) => ({
      startOffset: finalStartOffset,
      endOffset: finalStartOffset,
    }),
  },
  {
    condition: { isReplace: true, isRightOpen: true },
    behavior: ({ finalStartOffset, finalEndOffset }) => ({
      startOffset: finalStartOffset,
      endOffset: finalEndOffset,
    }),
  },
  {
    condition: { isReplace: false, hasCaptureRegex: true },
    behavior: ({ finalStartOffset, event: { text } }, _, { captureRegex }) => {
      const { source, flags } = captureRegex;
      const newRegex = new RegExp(
        source.startsWith("^") ? source : "^" + source,
        flags.replace("m", "")
      );

      const matches = text.match(newRegex);

      return matches == null
        ? {
            startOffset: finalStartOffset,
            endOffset: finalStartOffset,
          }
        : {
            startOffset: finalStartOffset,
            endOffset: finalStartOffset + matches[0].length,
          };
    },
  },
];

export function updateRangeInfos(
  changeEvent: TextDocumentChangeEvent,
  rangeInfos: RangeInfo[],
  rangeBehavior: DecorationRangeBehavior = DecorationRangeBehavior.ClosedClosed
) {
  const { document, contentChanges } = changeEvent;

  contentChanges.forEach((change) => {
    const changeDisplacement = change.text.length - change.rangeLength;
    const changeOriginalStartOffset = change.rangeOffset;
    const changeOriginalEndOffset =
      changeOriginalStartOffset + change.rangeLength;
    const changeFinalStartOffset = changeOriginalStartOffset;
    const changeFinalEndOffset = changeOriginalEndOffset + changeDisplacement;

    rangeInfos.forEach((selectionInfo) => {
      if (selectionInfo.document !== document) {
        return;
      }

      let newSelectionInfoStartOffset = computeNewOffset(
        selectionInfo.startOffset,
        changeStartOffset,
        changeEndOffset,
        changeDisplacement,
        rangeBehavior === DecorationRangeBehavior.OpenClosed ||
          rangeBehavior === DecorationRangeBehavior.OpenOpen
      );

      const newSelectionInfoEndOffset = computeNewOffset(
        selectionInfo.endOffset,
        changeStartOffset,
        changeEndOffset,
        changeDisplacement,
        rangeBehavior === DecorationRangeBehavior.OpenClosed ||
          rangeBehavior === DecorationRangeBehavior.ClosedClosed
      );

      // Handle the case where we're ClosedClosed and change intersects both
      // start and end
      newSelectionInfoStartOffset = Math.min(
        newSelectionInfoStartOffset,
        newSelectionInfoEndOffset
      );

      selectionInfo.range = selectionInfo.range.with(
        document.positionAt(newSelectionInfoStartOffset),
        document.positionAt(newSelectionInfoEndOffset)
      );
      selectionInfo.startOffset = newSelectionInfoStartOffset;
      selectionInfo.endOffset = newSelectionInfoEndOffset;
    });
  });
}

function computeNewOffset(
  originalOffset: number,
  changeStartOffset: number,
  changeEndOffset: number,
  changeDisplacement: number,
  moveLeftOnConflict: boolean
) {
  if (changeEndOffset < originalOffset) {
    return originalOffset + changeDisplacement;
  }

  if (changeStartOffset > originalOffset) {
    return originalOffset;
  }

  // todo handle fancy case with regex
  return moveLeftOnConflict
    ? changeStartOffset
    : changeEndOffset + changeDisplacement;
}
