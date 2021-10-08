import { invariant } from "immutability-helper";
import {
  DecorationRangeBehavior,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "vscode";
import { leftAnchored, rightAnchored } from "./regex";

interface RangeOffsets {
  start: number;
  end: number;
}

type SingleEdgeExpansionBehavior =
  | SimpleExpansionBehavior
  | RegexExpansionBehavior;

interface SimpleExpansionBehavior {
  type: "open" | "closed";
}

interface RegexExpansionBehavior {
  type: "regex";
  regex: RegExp;
}

interface ExpansionBehavior {
  start: SingleEdgeExpansionBehavior;
  end: SingleEdgeExpansionBehavior;
}

export interface RangeInfo {
  document: TextDocument;
  range: Range;
  offsets: RangeOffsets;
  expansionBehavior: ExpansionBehavior;
  text: string;
}

interface ExtendedTextDocumentContentChangeEvent
  extends TextDocumentContentChangeEvent {
  /**
   * If this is true then we should not shift an empty selection to the right
   */
  isReplace?: boolean;
}

interface ChangeEventInfo {
  event: ExtendedTextDocumentContentChangeEvent;
  originalOffsets: RangeOffsets;
  finalOffsets: RangeOffsets;
  displacement: number;
}

interface RangeOffsets {
  start: number;
  end: number;
}

function getOffsetsForEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: RangeInfo
): RangeOffsets {
  const {
    event: { text, isReplace },
    finalOffsets: { start, end },
  } = changeEventInfo;

  invariant(
    start === end &&
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

function getOffsetsForNonEmptyRangeInsert(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: RangeInfo
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

    switch (expansionBehavior.type) {
      case "closed":
        return {
          start: rangeStart + displacement,
          end: rangeEnd + displacement,
        };

      case "open":
        return {
          start: rangeStart,
          end: rangeEnd + displacement,
        };

      case "regex":
        let text = insertedText + originalRangeText;
        let index = text.search(rightAnchored(expansionBehavior.regex));
        while (index > insertedText.length) {
          // If the original range contains multiple matching instances of the regex use the leftmost one
          text = insertedText + originalRangeText.slice(index);
          index = text.search(rightAnchored(expansionBehavior.regex));
        }

        return index === -1
          ? {
              start: rangeStart,
              end: rangeEnd + displacement,
            }
          : {
              start: rangeStart + index,
              end,
            };
    }
  } else {
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
        const matches = insertedText.match(
          leftAnchored(expansionBehavior.regex)
        );

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
