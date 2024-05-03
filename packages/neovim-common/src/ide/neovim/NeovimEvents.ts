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
  // eventEmitter.on("onDidChangeTextDocument", listener);
  getNeovimRegistry().onEvent("onDidChangeTextDocument", listener);
  return dummyEvent();
}

export function neovimOnDidOpenTextDocument(
  listener: (event: TextDocument) => any,
  thisArgs?: any,
  disposables?: Disposable[] | undefined,
): Disposable {
  // eventEmitter.on("onDidOpenTextDocument", listener);
  getNeovimRegistry().onEvent("onDidOpenTextDocument", listener);
  return dummyEvent();
}

/**
 * @see https://neovim.io/doc/user/api.html#api-buffer-updates
 */
// TODO: wrap all the arguments into a neovim.TextDocumentContentChangeEvent?
// export async function receivedBufferEvent(
//   buffer: Buffer,
//   tick: number,
//   firstLine: number,
//   lastLine: number,
//   linedata: string[],
//   more: boolean,
// ): Promise<void> {
//   console.debug(
//     `receivedBufferEvent(): buffer.id=${buffer.id}, tick=${tick}, firstLine=${firstLine}, lastLine=${lastLine}, linedata=${linedata}, more=${more}`,
//   );

//   const neovimIDE = getNeovimIDE();
//   // We will need to get the document according to the buffer id
//   // once we want to support several windows
//   const document = neovimIDE.getTextDocument(buffer) as TextDocument;
//   // But for now we get the current document
//   // const document = (neovimIDE.activeTextEditor as TextEditor).document;

//   // const contents = await document.getText();
//   // console.debug(
//   //   `BufferManager.receivedBufferEvent(): document.uri=${document.uri}, contents (before):\n${contents}\n`,
//   // );
//   eventEmitter.emit("onDidChangeTextDocument", {
//     document: document,
//     contentChanges: fromNeovimContentChange(
//       document,
//       buffer,
//       firstLine,
//       lastLine,
//       linedata,
//     ),
//     //   reason: fromNeovimReason(...),
//   });
// }

// let count = 1;
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
  // TODO: simulate recorded/actions/breakJustThis on vscode for now but does not work anyway
  // /*   if (count === 0) {
  //   result = [];
  // } else  */ if (count === 1) {
  //   const range = new Range(new Position(0, 0), new Position(0, 3));
  //   result.push({
  //     range: range,
  //     rangeOffset: 0,
  //     rangeLength: 3,
  //     text: "ab ",
  //   });
  // } else if (count === 2) {
  //   const range = new Range(new Position(0, 1), new Position(0, 1));
  //   result.push({
  //     range: range,
  //     rangeOffset: 1,
  //     rangeLength: 0,
  //     text: "\n",
  //   });
  // } else {
  //   throw new Error(`fromNeovimContentChange(): unexpected count=${count}`);
  // }
  // count++;
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
