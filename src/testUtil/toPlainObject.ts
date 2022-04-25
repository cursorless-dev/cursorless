import { Selection, Position, Range } from "vscode";
import { Token } from "../typings/Types";

export type PositionPlainObject = {
  line: number;
  character: number;
};

export type RangePlainObject = {
  start: PositionPlainObject;
  end: PositionPlainObject;
};

export type SelectionPlainObject = {
  anchor: PositionPlainObject;
  active: PositionPlainObject;
};

export type SerializedMarks = {
  [decoratedCharacter: string]: RangePlainObject;
};

export function rangeToPlainObject(range: Range): RangePlainObject {
  return {
    start: positionToPlainObject(range.start),
    end: positionToPlainObject(range.end),
  };
}

export function selectionToPlainObject(
  selection: Selection
): SelectionPlainObject {
  return {
    anchor: positionToPlainObject(selection.anchor),
    active: positionToPlainObject(selection.active),
  };
}

export function positionToPlainObject(position: Position): PositionPlainObject {
  return { line: position.line, character: position.character };
}

export function marksToPlainObject(marks: {
  [decoratedCharacter: string]: Token;
}) {
  const serializedMarks: SerializedMarks = {};
  Object.entries(marks).forEach(
    ([key, value]: [string, Token]) =>
      (serializedMarks[key] = rangeToPlainObject(value.range))
  );
  return serializedMarks;
}
