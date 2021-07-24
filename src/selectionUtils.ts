import { Range, Selection, Position } from "vscode";
import update from "immutability-helper";
import { TypedSelection } from "./Types";

export function newSelection(selection: Selection, range: Range): Selection;
export function newSelection(isReversed: boolean, range: Range): Selection;
export function newSelection(
  selection: Selection,
  start: Position,
  end: Position
): Selection;
export function newSelection(
  isReversed: boolean,
  start: Position,
  end: Position
): Selection;

export function newSelection(
  selectionOrBool: Selection | boolean,
  rangeOrStart: Range | Position,
  end?: Position
): Selection {
  let isReversed, start;
  if (selectionOrBool instanceof Selection) {
    isReversed = selectionOrBool.isReversed;
  } else {
    isReversed = selectionOrBool;
  }
  if (rangeOrStart instanceof Range) {
    start = rangeOrStart.start;
    end = rangeOrStart.end;
  } else {
    start = rangeOrStart;
  }
  return isReversed ? new Selection(end!, start) : new Selection(start, end!);
}

export function newTypedSelection(
  selection: TypedSelection,
  range: Range
): TypedSelection;
export function newTypedSelection(
  selection: TypedSelection,
  start: Position,
  end: Position
): TypedSelection;
export function newTypedSelection(
  selection: TypedSelection,
  rangeOrStart: Range | Position,
  end?: Position
): TypedSelection {
  let sel: Selection;
  if (rangeOrStart instanceof Range) {
    sel = newSelection(selection.selection.selection, rangeOrStart);
  } else {
    sel = newSelection(selection.selection.selection, rangeOrStart, end!);
  }
  return update(selection, {
    selection: {
      selection: () => sel,
    },
  });
}
