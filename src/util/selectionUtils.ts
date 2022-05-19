import { Position, Range, Selection } from "vscode";
import { RemovalRange } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";

export function isForward(selection: Selection) {
  return selection.active.isAfterOrEqual(selection.anchor);
}

export function isReversed(selection: Selection) {
  return selection.active.isBefore(selection.anchor);
}

export function selectionWithEditorFromRange(
  selection: SelectionWithEditor,
  range: Range
): SelectionWithEditor {
  return selectionWithEditorFromPositions(selection, range.start, range.end);
}

function selectionWithEditorFromPositions(
  selection: SelectionWithEditor,
  start: Position,
  end: Position
): SelectionWithEditor {
  return {
    editor: selection.editor,
    selection: selectionFromPositions(selection.selection, start, end),
  };
}

function selectionFromPositions(
  selection: Selection,
  start: Position,
  end: Position
): Selection {
  // The built in isReversed is bugged on empty selection. don't use
  return isForward(selection)
    ? new Selection(start, end)
    : new Selection(end, start);
}

function removeSubRange(range: Range, rangeToRemove: Range) {
  const intersection = range.intersection(rangeToRemove);
  if (intersection == null) {
    return range;
  }
  if (intersection.contains(range.start)) {
    return new Range(intersection.end, range.end);
  }
  return new Range(range.start, intersection.start);
}

export function removeDelimiterRanges(
  range: Range,
  leading?: RemovalRange,
  trailing?: RemovalRange
) {
  if (leading != null) {
    range = removeSubRange(range, leading.range);
  }
  if (trailing != null) {
    range = removeSubRange(range, trailing.range);
  }
  return range;
}
