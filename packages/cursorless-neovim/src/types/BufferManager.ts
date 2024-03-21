//adapted from vscode-neovim\src\buffer_manager.ts

import { TextDocument, TextEditor } from "@cursorless/common";
import { Buffer } from "neovim";
import { NeovimExtensionContext } from "../ide/neovim/NeovimExtensionContext";
// import { Disposable, Uri } from "vscode";
import { eventEmitter } from "../events";
import { fromNeovimContentChange } from "../ide/neovim/NeovimEvents";
import { bufferManager } from "../singletons/bufmgr.singleton";
import { NeovimTextDocumentImpl } from "../ide/neovim/NeovimTextDocumentImpl";

const BUFFER_SCHEME = "neovim";

/**
 * Manages neovim windows & buffers and maps them to Cursorless editors & documents
 */
export class BufferManager /* implements Disposable */ {
  // TODO: all the text documents are external/internal in our case
  /**
   * Text documents originated externally, as consequence of neovim command, like :help or :PlugStatus
   */
  // public externalTextDocuments: WeakSet<TextDocument> = new Set();
  /**
   * TODO: change it to mapping of neovim buffer id -> Cursorless document
   * Mapping of Cursorless document -> neovim buffer id
   */
  public textDocumentToBufferId: Map<TextDocument, number> = new Map();
  /**
   * Mapping of neovim window id -> Cursorless editor
   */
  private winIdToEditor: Map<number, TextEditor> = new Map();

  /**
   * Buffer event delegate
   */
  public onBufferEvent?: (
    bufId: number,
    tick: number,
    firstLine: number,
    lastLine: number,
    linedata: string[],
    more: boolean,
  ) => void;

  private get client() {
    return this.context.client;
  }
  public constructor(
    private context: NeovimExtensionContext /* private main: MainController */,
  ) {
    this.context = context;
  }

  public getTextDocumentForBufferId(id: number): TextDocument | undefined {
    const doc = [...this.textDocumentToBufferId].find(
      ([, bufId]) => id === bufId,
    )?.[0];
    // return doc && !doc.isClosed ? doc : undefined;
    return doc;
  }

  public getBufferIdForTextDocument(doc: TextDocument): number | undefined {
    return this.textDocumentToBufferId.get(doc);
  }

  public getEditorFromWinId(winId: number): TextEditor | undefined {
    // try first noColumnEditors
    // const noColumnEditor = [...this.textEditorToWinId].find(
    //   ([, id]) => id === winId,
    // );
    // if (noColumnEditor) {
    //   return noColumnEditor[0];
    // }
    return this.winIdToEditor.get(winId);
  }

  //   public async onDidChangeTextDocument(
  //     event: TextDocumentChangeEvent,
  //   ): Promise<Disposable> {
  //     const disposable = {
  //       dispose: () => {
  //         // empty
  //       },
  //     };

  //     const id = this.getBufferIdForTextDocument(event.document);
  //     const buffers = await this.context.client.buffers;
  //     const buf = buffers.find((b) => b.id === id);
  //     if (!buf) {
  //       console.warn(`external buffer ${id} not found`);
  //       return disposable;
  //     }
  //     buf.listen("lines", this.receivedBufferEvent);
  //     return dummyEvent();
  //   }

  // public buildExternalBufferUri(name: string, id: number): Uri {
  //   // These might not *always* be file names, but they often are (e.g. for :help) so
  //   // make sure we properly convert slashes for the path component, especially on Windows
  //   return Uri.file(name).with({
  //     scheme: BUFFER_SCHEME,
  //     authority: id.toString(),
  //   });
  // }
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
  // this.onBufferEvent?.(buffer.id, tick, firstLine, lastLine, linedata, more);
  // // Ensure the receivedBufferEvent callback finishes before we fire
  // // the event notifying the doc provider of any changes
  // (async () => {
  //     const uri = this.buildExternalBufferUri(await buffer.name, buffer.id);
  //     logger.log(uri, LogLevel.debug, `received buffer event for ${uri}`);
  //     this.bufferProvider.documentDidChange.fire(uri);
  //     return uri;
  // })().then(undefined, (e) => {
  //     logger.log(undefined, LogLevel.error, `failed to notify document change: ${e}`);
  // });
  console.warn(
    `BufferManager.receivedBufferEvent(): buffer.id=${buffer.id}, tick=${tick}, firstLine=${firstLine}, lastLine=${lastLine}, linedata=${linedata}, more=${more}`,
  );

  const document = bufferManager().getTextDocumentForBufferId(
    buffer.id,
  ) as NeovimTextDocumentImpl;
  // const contents = await document.getText();
  // console.warn(
  //   `BufferManager.receivedBufferEvent(): document.uri=${document.uri}, contents (before):\n${contents}\n`,
  // );
  eventEmitter.emit("onDidChangeTextDocument", {
    document: document,
    contentChanges: fromNeovimContentChange(
      buffer,
      firstLine,
      lastLine,
      linedata,
    ),
    //   reason: fromNeovimReason(...),
  });
}

function dummyEvent() {
  return {
    dispose: () => {
      // empty
    },
  };
}
