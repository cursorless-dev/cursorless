import * as vscode from "vscode";
import { Range } from "../../libs/common/ide";
import type TextLine from "../../libs/common/ide/types/TextLine";
import { fromVscodeRange } from "./VscodeUtil";

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
    return this.line.firstNonWhitespaceCharacterIndex;
  }

  get lastNonWhitespaceCharacterIndex(): number {
    return (
      this.line.range.end.character -
      (this.line.text.length - this.line.text.trimEnd().length)
    );
  }

  get isEmptyOrWhitespace(): boolean {
    return this.line.isEmptyOrWhitespace;
  }
}
