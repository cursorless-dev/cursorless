import {
  Disposable,
  Position,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";
import { getNeovimRegistry } from "@cursorless/neovim-registry";

import type { Buffer } from "neovim";

export function neovimOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  getNeovimRegistry().onEvent("onDidChangeTextDocument", listener);
  return dummyEvent();
}

export function neovimOnDidOpenTextDocument(
  listener: (event: TextDocument) => any,
  thisArgs?: any,
  disposables?: Disposable[] | undefined,
): Disposable {
  getNeovimRegistry().onEvent("onDidOpenTextDocument", listener);
  return dummyEvent();
}

export function fromNeovimContentChange(
  document: TextDocument,
  buffer: Buffer,
  firstLine: number,
  lastLine: number,
  linedata: string[],
): TextDocumentContentChangeEvent[] {
  const result = [];
  const text = linedata.join("\n");
  console.debug(
    `fromNeovimContentChange(): document.getText(): '${document.getText()}'`,
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
  console.debug(`fromNeovimContentChange(): changes=${JSON.stringify(result)}`);
  return result;
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
