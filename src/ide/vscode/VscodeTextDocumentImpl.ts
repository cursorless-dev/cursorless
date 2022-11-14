import * as vscode from "vscode";
import type { URI } from "vscode-uri";
import { Range } from "../../libs/common/ide";
import Position from "../../libs/common/ide/Position";
import TextDocument from "../../libs/common/ide/types/TextDocument";
import TextLine from "../../libs/common/ide/types/TextLine";
import {
  fromVscodePosition,
  fromVscodeTextLine,
  toVscodePosition,
  toVscodeRange,
} from "./VscodeUtil";

export default class VscodeTextDocumentImpl implements TextDocument {
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

  public lineAt = (lineOrPosition: number | Position): TextLine => {
    return fromVscodeTextLine(
      this.document.lineAt(
        typeof lineOrPosition === "number"
          ? lineOrPosition
          : lineOrPosition.line,
      ),
    );
  };

  public offsetAt = (position: Position): number => {
    return this.document.offsetAt(toVscodePosition(position));
  };

  public positionAt = (offset: number): Position => {
    return fromVscodePosition(this.document.positionAt(offset));
  };

  public getText = (range?: Range): string => {
    return this.document.getText(
      range != null ? toVscodeRange(range) : undefined,
    );
  };
}
