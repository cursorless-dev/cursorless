import {
  EndOfLine,
  Position,
  Range,
  TextDocument,
  TextLine,
} from "@cursorless/common";
// import {
//   fromVscodeEndOfLine,
//   fromVscodePosition,
//   toVscodePosition,
//   toVscodeRange,
// } from "@cursorless/vscode-common";
// import * as vscode from "vscode";
import { URI } from "vscode-uri";
// import {
//   fromVscodePosition,
//   toVscodePosition,
//   toVscodeRange,
// } from "../../vscodeUtil";
import NeovimTextLineImpl from "./NeovimTextLineImpl";
import { bufferManager } from "../../singletons/bufmgr.singleton";
import { neovimContext } from "../../singletons/context.singleton";
import { Buffer } from "neovim";

export class NeovimTextDocumentImpl implements TextDocument {
  private buffer: Buffer;
  private _uri: URI;
  private _languageId: string;
  private _version: number;
  private _lineCount: number;

  get uri(): URI {
    return this._uri;
  }

  get languageId(): string {
    return this._languageId;
  }

  get version(): number {
    return this._version;
  }

  get lineCount(): number {
    return this._lineCount;
  }

  get range(): Range {
    const { end } = this.lineAt(this.lineCount - 1).range;
    return new Range(0, 0, end.line, end.character);
  }

  get eol(): EndOfLine {
    return "LF"; // TODO: update
  }

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this._uri = URI.parse(`neovim://${buffer.id}`);
    this._languageId = "plaintext"; // TODO: update
    this._version = 1;
    this._lineCount = this.buffer.length as unknown as number; // TODO: update
  }

  public lineAt(lineOrPosition: number | Position): TextLine {
    return new NeovimTextLineImpl(
      this.buffer,
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line,
    ); // TODO: update
  }

  public offsetAt(position: Position): number {
    return 0; // TODO: update
    // return this.document.offsetAt(position);
  }

  public positionAt(offset: number): Position {
    return new Position(0, 0); // TODO: update
    // return this.document.positionAt(offset);
  }

  public getText(range?: Range): string {
    const lines = this.buffer.lines as unknown as string[]; // TODO: update
    if (range != null) {
      return lines.slice(range.start.line, range.end.line + 1).join("\n"); // TODO: update
    }
    return lines.join("\n"); // TODO: update
  }
}
