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
  rangeOrPosition: Range | Position,
  ...args: Array<Position>
): Selection {
  let isReversed, start, end;
  if (selectionOrBool instanceof Selection) {
    isReversed = selectionOrBool.isReversed;
  } else {
    isReversed = selectionOrBool;
  }
  if (rangeOrPosition instanceof Range) {
    start = rangeOrPosition.start;
    end = rangeOrPosition.end;
  } else {
    start = rangeOrPosition;
    end = args[0];
  }
  return isReversed ? new Selection(end, start) : new Selection(start, end);
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
  rangeOrPosition: Range | Position,
  ...args: Array<Position>
): TypedSelection {
  let sel: Selection;
  if (rangeOrPosition instanceof Range) {
    sel = newSelection(selection.selection.selection, rangeOrPosition);
  } else {
    sel = newSelection(selection.selection.selection, rangeOrPosition, args[0]);
  }
  return update(selection, {
    selection: {
      selection: () => sel,
    },
  });
}
