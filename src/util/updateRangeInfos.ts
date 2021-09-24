import {
  DecorationRangeBehavior,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "vscode";
import { leftAnchored, rightAnchored } from "./regex";

export interface RangeInfo {
  document: TextDocument;
  range: Range;
  offsets: RangeOffsets;
}

interface ChangeEventInfo {
  event: TextDocumentContentChangeEvent;
  originalOffsets: RangeOffsets;
  finalOffsets: RangeOffsets;
  displacement: number;
}

interface RangeOffsets {
  start: number;
  end: number;
}

type ExpansionBehavior = "open" | "closed" | "regex";

interface BehaviorCondition {
  isReplace?: boolean;

  leftExpansionBehavior?: ExpansionBehavior;
  rightExpansionBehavior?: ExpansionBehavior;
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
    condition: { isReplace: false, leftExpansionBehavior: "closed" },
    behavior: ({ finalOffsets: { end } }) => ({
      start: end,
      end,
    }),
  },
  {
    condition: { isReplace: false, leftExpansionBehavior: "open" },
    behavior: ({ finalOffsets }) => finalOffsets,
  },
  {
    condition: { isReplace: false, leftExpansionBehavior: "regex" },
    behavior: (
      { finalOffsets: { start, end }, event: { text } },
      _,
      { captureRegex }
    ) => {
      const index = text.search(rightAnchored(captureRegex));

      return index === -1
        ? {
            start: end,
            end,
          }
        : {
            start: start + index,
            end,
          };
    },
  },
  {
    condition: { isReplace: true, rightExpansionBehavior: "closed" },
    behavior: ({ finalOffsets: { start } }) => ({
      start,
      end: start,
    }),
  },
  {
    condition: { isReplace: true, rightExpansionBehavior: "open" },
    behavior: ({ finalOffsets }) => finalOffsets,
  },
  {
    condition: { isReplace: true, rightExpansionBehavior: "regex" },
    behavior: (
      { finalOffsets: { start }, event: { text } },
      _,
      { captureRegex }
    ) => {
      const matches = text.match(leftAnchored(captureRegex));

      return matches == null
        ? {
            start,
            end: start,
          }
        : {
            start,
            end: start + matches[0].length,
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
