import {
  Disposable,
  NormalizedIDE,
  Position,
  Range,
  SpyIDE,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  TextEditor,
} from "@cursorless/common";

import { Buffer } from "neovim";
import { eventEmitter } from "../../events";
import { NeovimIDE } from "./NeovimIDE";
import { ide } from "@cursorless/cursorless-engine";

export function neovimOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  eventEmitter.on("onDidChangeTextDocument", listener);
  return dummyEvent();
}

/**
 * @see https://neovim.io/doc/user/api.html#api-buffer-updates
 */
// TODO: wrap all the arguments into a neovim.TextDocumentContentChangeEvent?
export async function receivedBufferEvent(
  buffer: Buffer,
  tick: number,
  firstLine: number,
  lastLine: number,
  linedata: string[],
  more: boolean,
): Promise<void> {
  console.warn(
    `BufferManager.receivedBufferEvent(): buffer.id=${buffer.id}, tick=${tick}, firstLine=${firstLine}, lastLine=${lastLine}, linedata=${linedata}, more=${more}`,
  );

  const ide_ = ide();
  // TODO: It there a clean way to do it? Yes once we support pure dependency injection
  // also we can make this function a method of NeovimIDE class
  let neovimIDE: NeovimIDE;
  if (ide_ instanceof NeovimIDE) {
    neovimIDE = ide_;
  } else if (ide_ instanceof NormalizedIDE) {
    neovimIDE = ide_.original as NeovimIDE;
  } else if (ide_ instanceof SpyIDE) {
    const normalizedIDE = ide_.original as NormalizedIDE;
    neovimIDE = normalizedIDE.original as NeovimIDE;
  } else {
    throw Error("receivedBufferEvent(): ide() is not NeovimIDE");
  }
  // We will need to get the document according to the buffer id
  // once we want to support several windows
  //const document = getTextDocumentForBufferId(buffer.id);
  // But for now we get the current document
  const document = (neovimIDE.activeTextEditor as TextEditor).document;

  // const contents = await document.getText();
  // console.warn(
  //   `BufferManager.receivedBufferEvent(): document.uri=${document.uri}, contents (before):\n${contents}\n`,
  // );
  eventEmitter.emit("onDidChangeTextDocument", {
    document: document,
    contentChanges: fromNeovimContentChange(
      document,
      buffer,
      firstLine,
      lastLine,
      linedata,
    ),
    //   reason: fromNeovimReason(...),
  });
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
  console.warn(
    `fromNeovimContentChange(): document.getText(): ${document.getText()}`,
  );
  // TODO: support when firstLine === lastLine
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
  return result;
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}
