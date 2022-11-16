import { Range, TextLine } from "@cursorless/common";
import { fromVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";

export default class VscodeTextLineImpl implements TextLine {
  constructor(private line: vscode.TextLine) {}

  get lineNumber(): number {
    return this.line.lineNumber;
  }

  get text(): string {
    return this.line.text;
  }

  get range(): Range {
    return fromVscodeRange(this.line.range);
  }

  get rangeIncludingLineBreak(): Range {
    return fromVscodeRange(this.line.rangeIncludingLineBreak);
  }

  get firstNonWhitespaceCharacterIndex(): number {
    return this.isEmptyOrWhitespace
      ? 0
      : this.line.firstNonWhitespaceCharacterIndex;
  }

  get lastNonWhitespaceCharacterIndex(): number {
    return this.isEmptyOrWhitespace
      ? this.line.text.length
      : this.line.text.trimEnd().length;
  }

  get isEmptyOrWhitespace(): boolean {
    return this.line.isEmptyOrWhitespace;
  }
}
