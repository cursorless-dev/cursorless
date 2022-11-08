import { Range, TextDocument } from "vscode";

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
