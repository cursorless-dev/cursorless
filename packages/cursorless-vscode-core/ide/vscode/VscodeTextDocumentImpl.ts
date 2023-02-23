import { Position, Range, TextDocument, TextLine } from "@cursorless/common";
import {
  fromVscodePosition,
  toVscodePosition,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { URI } from "vscode-uri";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

export class VscodeTextDocumentImpl implements TextDocument {
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

  constructor(private document: vscode.TextDocument) {}

  public lineAt(lineOrPosition: number | Position): TextLine {
    return new VscodeTextLineImpl(
      this.document.lineAt(
        typeof lineOrPosition === "number"
          ? lineOrPosition
          : lineOrPosition.line,
      ),
    );
  }

  public offsetAt(position: Position): number {
    return this.document.offsetAt(toVscodePosition(position));
  }

  public positionAt(offset: number): Position {
    return fromVscodePosition(this.document.positionAt(offset));
  }

  public getText(range?: Range): string {
    return this.document.getText(
      range != null ? toVscodeRange(range) : undefined,
    );
  }
}
