import * as path from "node:path";
import type * as vscode from "vscode";
import type { URI } from "vscode-uri";
import type {
  EndOfLine,
  Position,
  TextDocument,
  TextLine,
} from "@cursorless/lib-common";
import { Range } from "@cursorless/lib-common";
import {
  fromVscodeEndOfLine,
  fromVscodePosition,
  toVscodePosition,
  toVscodeRange,
} from "@cursorless/lib-vscode-common";
import { VscodeTextLine } from "./VscodeTextLine";

export class VscodeTextDocument implements TextDocument {
  get uri(): URI {
    return this.document.uri;
  }

  get filename(): string {
    return path.basename(this.document.uri.path);
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
    return fromVscodeEndOfLine(this.document.eol);
  }

  constructor(private document: vscode.TextDocument) {}

  public lineAt(lineOrPosition: number | Position): TextLine {
    return new VscodeTextLine(
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
