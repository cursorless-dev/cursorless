import * as vscode from "vscode";
import type { URI } from "vscode-uri";
import Position from "../../libs/common/ide/Position";
import Range from "../../libs/common/ide/Range";
import TextDocument from "../../libs/common/ide/types/TextDocument";
import TextLine from "../../libs/common/ide/types/TextLine";
import { toVscodePosition, toVscodeRange } from "./VscodeUtil";

export default class VscodeTextDocument implements TextDocument {
  get uri(): URI {
    return this.document.uri;
  }

  get languageId(): string {
    return this.document.languageId;
  }

  constructor(private document: vscode.TextDocument) {}

  getRange(): Range {
    return new Range(
      new Position(0, 0),
      this.document.lineAt(this.document.lineCount - 1).range.end,
    );
  }

  lineAt(lineOrPosition: number | Position): TextLine {
    return this.document.lineAt(
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line,
    );
  }

  offsetAt(position: Position): number {
    return this.document.offsetAt(toVscodePosition(position));
  }

  positionAt(offset: number): Position {
    return this.document.positionAt(offset);
  }

  getText(range?: Range | undefined): string {
    return this.document.getText(
      range != null ? toVscodeRange(range) : undefined,
    );
  }
}
