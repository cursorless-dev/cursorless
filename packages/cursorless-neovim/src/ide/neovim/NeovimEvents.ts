// // import { fromVscodeRange } from "@cursorless/vscode-common";
// // import * as vscode from "vscode";
// import type {
//   TextDocumentChangeEvent,
//   TextDocumentChangeReason,
//   TextDocumentContentChangeEvent,
// } from "@cursorless/common";
// import { Event } from "@cursorless/common";
// import type { Disposable } from "@cursorless/common";
// import { NeovimTextDocumentImpl } from "./NeovimTextDocumentImpl";
// import { neovimContext } from "../../singletons/context.singleton";
// import { bufferManager } from "../../singletons/bufmgr.singleton";
import {
  Disposable,
  Position,
  Range,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";

import { Buffer } from "neovim";
import { eventEmitter } from "../../events";

export function neovimOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  eventEmitter.on("onDidChangeTextDocument", listener);
  return dummyEvent();
}

export function fromNeovimContentChange(
  buffer: Buffer,
  firstLine: number,
  lastLine: number,
  linedata: string[],
): TextDocumentContentChangeEvent[] {
  const result = [];
  for (let i = 0; i < lastLine - firstLine; ++i) {
    const line = firstLine + i;
    const text = linedata[i];
    console.warn(`fromNeovimContentChange(): line=${line}, text=${text}`);
    result.push({
      range: new Range(new Position(line, 0), new Position(line, text.length)),
      rangeOffset: 0,
      rangeLength: 0,
      text: text,
    });
  }
  return result;
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
