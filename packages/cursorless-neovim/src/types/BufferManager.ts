//adapted from vscode-neovim\src\buffer_manager.ts

import { TextDocument, TextEditor } from "@cursorless/common";
import { Buffer, NeovimClient } from "neovim";
import { ATTACH } from "neovim/lib/api/Buffer";
import { NeovimExtensionContext } from "../ide/neovim/NeovimExtensionContext";

// TODO: comment taken from vscode-neovim so needs review
// Integration notes:
// 1. Each document corresponds to a buffer
// 2. Each editor corresponds to a window
// 3. Generally, an editor corresponds to a document, so the buffer and window in neovim have a one-to-one relationship
// 4. When visibleTextEditors change => create a buffer and window in neovim
// 5. When activeTextEditor changes => set the current window in neovim

/**
 * Manages neovim windows & buffers and maps them to Cursorless editors & documents
 */
export class BufferManager /* implements Disposable */ {
  /**
   * TODO: change it to mapping of neovim buffer id -> Cursorless document
   * Mapping of Cursorless document -> neovim buffer id
   */
  private textDocumentToBufferId: Map<TextDocument, number> = new Map();
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

  /**
   * @see https://neovim.io/doc/user/api.html#api-buffer-updates
   */
  public receivedBufferEvent = (
    buffer: Buffer,
    tick: number,
    firstLine: number,
    lastLine: number,
    linedata: string[],
    more: boolean,
  ): void => {
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
  };
}
