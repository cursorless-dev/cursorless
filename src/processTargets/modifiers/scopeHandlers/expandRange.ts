import { Position, Range, TextDocument } from "@cursorless/common";

export function expandRange(
  numCharactersBackward: number,
  numCharactersForward: number,
  document: TextDocument,
  { start, end }: Range,
) {
  return new Range(
    document.positionAt(document.offsetAt(start) - numCharactersBackward),
    document.positionAt(document.offsetAt(end) + numCharactersForward),
  );
}

export function expandPosition(
  numCharactersBackward: number,
  numCharactersForward: number,
  document: TextDocument,
  position: Position,
) {
  return new Range(
    document.positionAt(document.offsetAt(position) - numCharactersBackward),
    document.positionAt(document.offsetAt(position) + numCharactersForward),
  );
}
