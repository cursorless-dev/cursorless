import type { TextLine } from "@cursorless/common";
import { Range } from "@cursorless/common";

export default class NeovimTextLineImpl implements TextLine {
  private readonly _lineNumber: number;
  private readonly _text: string;
  private readonly _isLastLine: boolean;

  constructor(lineNumber: number, text: string, isLastLine: boolean) {
    // console.debug(
    //   `NeovimTextLineImpl(): lineNumber=${lineNumber}, text='${text}', isLastLine=${isLastLine}`,
    // );
    this._lineNumber = lineNumber;
    this._text = text;
    this._isLastLine = isLastLine;
  }

  get lineNumber(): number {
    return this._lineNumber;
  }

  get text(): string {
    // console.debug(`NeovimTextLineImpl.text()='${this._text}'`);
    return this._text;
  }

  get range(): Range {
    // console.debug(
    //   `NeovimTextLineImpl.range(): range=(${this._lineNumber}, 0), (${this._lineNumber}, ${this._text.length})`,
    // );
    return new Range(this._lineNumber, 0, this._lineNumber, this._text.length);
  }

  get rangeIncludingLineBreak(): Range {
    if (this._isLastLine) {
      // console.debug(
      //   `NeovimTextLineImpl.rangeIncludingLineBreak(): last line=(${this.range.start.line}, ${this.range.start.character}), (${this.range.end.line}, ${this.range.end.character})`,
      // );
      return this.range;
    }
    // console.debug(
    //   `NeovimTextLineImpl.rangeIncludingLineBreak(): range=(${
    //     this._lineNumber
    //   }, 0), ${this._lineNumber + 1}, 0})`,
    // );
    return new Range(this._lineNumber, 0, this._lineNumber + 1, 0);
  }

  get rangeTrimmed(): Range | undefined {
    const startIndex = /^(\s*)/.exec(this._text)![1].length;
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
