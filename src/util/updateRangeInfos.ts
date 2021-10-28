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
  range: Range;
  expansionBehavior: ExpansionBehavior;
}

export interface FullRangeInfo extends RangeInfo {
  offsets: RangeOffsets;
  text: string;
}

interface ExtendedTextDocumentContentChangeEvent
  extends TextDocumentContentChangeEvent {
  /**
   * If this is true then we should not shift an empty selection to the right
   */
  isReplace?: boolean;
}

export interface ExtendedTextDocumentChangeEvent
  extends TextDocumentChangeEvent {
  readonly contentChanges: ReadonlyArray<ExtendedTextDocumentContentChangeEvent>;
}

interface ChangeEventInfo {
  event: ExtendedTextDocumentContentChangeEvent;
  originalOffsets: RangeOffsets;
  finalOffsets: RangeOffsets;

  /**
   * Indicates the difference between the final token length and the original token length
   */
  displacement: number;
}

interface RangeOffsets {
  start: number;
  end: number;
}

function getOffsetsForEmptyRangeInsert(
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

function getOffsetsForNonEmptyRangeInsert(
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

function getOffsetsForDeleteOrReplace(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo
): RangeOffsets {
  const {
    originalOffsets: {
      start: changeOriginalStartOffset,
      end: changeOriginalEndOffset,
    },
    finalOffsets: { end: changeFinalEndOffset },
    displacement,
  } = changeEventInfo;
  const {
    offsets: { start: rangeStart, end: rangeEnd },
  } = rangeInfo;

  invariant(
    changeOriginalEndOffset > changeOriginalStartOffset,
    () => "Change range expected to be nonempty"
  );
  invariant(
    changeOriginalEndOffset >= rangeStart &&
      changeOriginalStartOffset <= rangeEnd,
    () => "Change range expected to intersect with selection range"
  );

  return {
    start: Math.min(rangeStart, changeFinalEndOffset),
    end:
      changeOriginalStartOffset < rangeEnd
        ? rangeEnd + displacement
        : Math.min(rangeEnd, changeFinalEndOffset),
  };
}

export function updateRangeInfos(
  changeEvent: ExtendedTextDocumentChangeEvent,
  rangeInfos: FullRangeInfo[]
) {
  const { document, contentChanges } = changeEvent;

  contentChanges.forEach((change) => {
    const changeDisplacement = change.text.length - change.rangeLength;
    const changeOriginalStartOffset = change.rangeOffset;
    const changeOriginalEndOffset =
      changeOriginalStartOffset + change.rangeLength;
    const changeFinalStartOffset = changeOriginalStartOffset;
    const changeFinalEndOffset = changeOriginalEndOffset + changeDisplacement;

    const changeEventInfo: ChangeEventInfo = {
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

    rangeInfos.forEach((rangeInfo) => {
      const originalOffsets = rangeInfo.offsets;
      let newOffsets: RangeOffsets;

      if (changeOriginalEndOffset < originalOffsets.start) {
        return;
      }

      if (changeOriginalStartOffset > originalOffsets.end) {
        newOffsets = {
          start: originalOffsets.start,
          end: originalOffsets.end + changeDisplacement,
        };
      } else {
        if (change.rangeLength === 0) {
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
      }

      rangeInfo.range = rangeInfo.range.with(
        document.positionAt(newOffsets.start),
        document.positionAt(newOffsets.end)
      );
      rangeInfo.offsets = newOffsets;
    });
  });
}
function getUpdatedText(
  changeEventInfo: ChangeEventInfo,
  rangeInfo: FullRangeInfo,
  newOffsets: RangeOffsets
): string {
  const { start: changeOriginalOffsetsStart, end: changeOriginalOffsetsEnd } =
    changeEventInfo.originalOffsets;
  const { start: rangeOriginalOffsetsStart, end: rangeOriginalOffsetsEnd } =
    rangeInfo.offsets;
  const newTextStartOffset = Math.min(
    changeOriginalOffsetsStart,
    rangeOriginalOffsetsStart
  );

  let result = "";

  if (rangeOriginalOffsetsStart < changeOriginalOffsetsStart) {
    result += rangeInfo.text.substring(
      changeOriginalOffsetsStart - rangeOriginalOffsetsStart
    );
  }

  result += changeEventInfo.event.text;

  if (changeOriginalOffsetsEnd < rangeOriginalOffsetsEnd) {
    result += rangeInfo.text.substring(
      rangeOriginalOffsetsEnd - changeOriginalOffsetsEnd,
      rangeInfo.text.length
    );
  }

  return result.substring(
    newOffsets.start - newTextStartOffset,
    newOffsets.end - newTextStartOffset
  );
}
