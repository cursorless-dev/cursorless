import type {
  Disposable,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";
import { Position, Range } from "@cursorless/common";

export function jetbrainsOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  return dummyEvent();
}

export function jetbrainsOnDidOpenTextDocument(
  listener: (event: TextDocument) => any,
  _thisArgs?: any,
  _disposables?: Disposable[] | undefined,
): Disposable {
  return dummyEvent();
}

export function fromJetbrainsContentChange(
  document: TextDocument,
  buffer: Buffer,
  firstLine: number,
  lastLine: number,
  linedata: string[],
): TextDocumentContentChangeEvent[] {
  const result = [];
  const text = linedata.join("\n");
  console.debug(
    `fromJetbrainsContentChange(): document.getText(): '${document.getText()}'`,
  );
  const range = new Range(
    new Position(firstLine, 0),
    new Position(lastLine - 1, document.lineAt(lastLine - 1).text.length),
  );
  const rangeOffset = document.offsetAt(range.start);
  const rangeLength = document.offsetAt(range.end) - rangeOffset;
  result.push({
    range: range,
    rangeOffset: rangeOffset,
    rangeLength: rangeLength,
    text: text,
  });
  console.debug(`fromJetbrainsContentChange(): changes=${JSON.stringify(result)}`);
  return result;
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
