import { Selection, Position, Range } from "vscode";
import { Token } from "./Types";

export type SerializedPosition = {
  line: number;
  character: number;
};

export type SerializedRange = {
  start: SerializedPosition;
  end: SerializedPosition;
};

export type SerializedSelection = {
  anchor: SerializedPosition;
  active: SerializedPosition;
};

export type SerializedMarks = { [coloredSymbol: string]: SerializedRange };

export function serializeRange(range: Range): SerializedRange {
  return {
    start: serializePosition(range.start),
    end: serializePosition(range.end),
  };
}

export function serializeSelection(selection: Selection): SerializedSelection {
  return {
    active: serializePosition(selection.active),
    anchor: serializePosition(selection.anchor),
  };
}

export function serializePosition(position: Position): SerializedPosition {
  return { line: position.line, character: position.character };
}

export function serializeMarks(marks: { [coloredSymbol: string]: Token }) {
  const serializedMarks: SerializedMarks = {};
  Object.entries(marks).forEach(
    ([key, value]: [string, Token]) =>
      (serializedMarks[key] = serializeRange(value.range))
  );
  return serializedMarks;
}
