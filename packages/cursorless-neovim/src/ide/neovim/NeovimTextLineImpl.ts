import { Range, TextLine } from "@cursorless/common";
// import { fromVscodeRange } from "../../vscodeUtil";
// import * as vscode from "vscode";

export default class NeovimTextLineImpl implements TextLine {
  constructor(private line: TextLine) {}

  get lineNumber(): number {
    return this.line.lineNumber;
  }

  get text(): string {
    return this.line.text;
  }

  get range(): Range {
    // return fromVscodeRange(this.line.range);
    return this.line.range;
  }

  get rangeIncludingLineBreak(): Range {
    // return fromVscodeRange(this.line.rangeIncludingLineBreak);
    return this.line.rangeIncludingLineBreak;
  }

  get firstNonWhitespaceCharacterIndex(): number {
    return this.line.firstNonWhitespaceCharacterIndex;
  }

  get lastNonWhitespaceCharacterIndex(): number {
    return this.line.text.trimEnd().length;
  }

  get isEmptyOrWhitespace(): boolean {
    return this.line.isEmptyOrWhitespace;
  }
}
