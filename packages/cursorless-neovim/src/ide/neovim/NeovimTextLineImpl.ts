import { Range, TextLine } from "@cursorless/common";
// import { fromVscodeRange } from "../../vscodeUtil";
// import * as vscode from "vscode";
import { Buffer } from "neovim";

export default class NeovimTextLineImpl implements TextLine {
  private buffer: Buffer;
  private _lineNumber: number;

  constructor(buffer: Buffer, lineNumber: number) {
    this.buffer = buffer;
    this._lineNumber = lineNumber;
  }

  get lineNumber(): number {
    return this._lineNumber;
  }

  get text(): string {
    const lines = this.buffer.getLines({
      start: this.lineNumber,
      end: this.lineNumber + 1,
      strictIndexing: true,
    }) as unknown as string[]; // TODO: update
    return lines[0];
  }

  get range(): Range {
    return new Range(this.lineNumber, 0, this.lineNumber, this.text.length); // TODO: update
  }

  get rangeIncludingLineBreak(): Range {
    return new Range(this.lineNumber, 0, this.lineNumber, this.text.length + 1); // TODO: update
  }

  get firstNonWhitespaceCharacterIndex(): number {
    return this.text.trimStart().length;
  }

  get lastNonWhitespaceCharacterIndex(): number {
    return this.text.trimEnd().length; //TODO: update
  }

  get isEmptyOrWhitespace(): boolean {
    return this.firstNonWhitespaceCharacterIndex === this.text.length;
  }
}
