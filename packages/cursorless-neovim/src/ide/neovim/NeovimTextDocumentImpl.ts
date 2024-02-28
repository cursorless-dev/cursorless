import {
  EndOfLine,
  Position,
  Range,
  Selection,
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
import type { URI } from "vscode-uri";
// import {
//   fromVscodePosition,
//   toVscodePosition,
//   toVscodeRange,
// } from "../../vscodeUtil";
import NeovimTextLineImpl from "./NeovimTextLineImpl";

export class NeovimTextDocumentImpl implements TextDocument {
  get uri(): URI {
    return this.document.uri;
  }

  get languageId(): string {
    return this.document.languageId;
  }

  get version(): number {
    return this.document.version;
  }

  get lineCount(): number {
    return this.document.lineCount;
  }

  get range(): Range {
    const { end } = this.document.lineAt(this.document.lineCount - 1).range;
    return new Range(0, 0, end.line, end.character);
  }

  get eol(): EndOfLine {
    return "LF";
    // return fromVscodeEndOfLine(this.document.eol);
  }

  constructor(private document: TextDocument) {}

  public lineAt(lineOrPosition: number | Position): TextLine {
    return new NeovimTextLineImpl(
      this.document.lineAt(
        typeof lineOrPosition === "number"
          ? lineOrPosition
          : lineOrPosition.line,
      ),
    );
  }

  public offsetAt(position: Position): number {
    return this.document.offsetAt(position);
  }

  public positionAt(offset: number): Position {
    return this.document.positionAt(offset);
  }

  public getText(range?: Range): string {
    return this.document.getText(range != null ? range : undefined);
  }
}
