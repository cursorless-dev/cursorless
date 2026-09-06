import type { TextLine } from "@cursorless/lib-common";
import { Range } from "@cursorless/lib-common";

export class NeovimTextLine implements TextLine {
  private readonly _lineNumber: number;
  private readonly _text: string;
  private readonly _isLastLine: boolean;

  constructor(lineNumber: number, text: string, isLastLine: boolean) {
    this._lineNumber = lineNumber;
    this._text = text;
    this._isLastLine = isLastLine;
  }

  get lineNumber(): number {
    return this._lineNumber;
  }

  get text(): string {
    return this._text;
  }

  get range(): Range {
    return new Range(this._lineNumber, 0, this._lineNumber, this._text.length);
  }

  get rangeIncludingLineBreak(): Range {
    if (this._isLastLine) {
      return this.range;
    }
    return new Range(this._lineNumber, 0, this._lineNumber + 1, 0);
  }

  get rangeTrimmed(): Range | undefined {
    const startIndex = /^(\s*)/u.exec(this._text)![1].length;
    if (startIndex === this._text.length) {
      return undefined;
    }
    const endIndex = this.text.trimEnd().length;
    return new Range(this._lineNumber, startIndex, this._lineNumber, endIndex);
  }

  get isEmptyOrWhitespace(): boolean {
    return this.rangeTrimmed == null;
  }
}
