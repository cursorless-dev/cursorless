import { Range, TextLine } from "@cursorless/common";

export default class InMemoryTextLineImpl implements TextLine {
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

  get firstNonWhitespaceCharacterIndex(): number {
    //TODO@api, rename to 'leadingWhitespaceLength'
    return /^(\s*)/.exec(this._text)![1].length;
  }

  get lastNonWhitespaceCharacterIndex(): number {
    const all = this.text.match(/\S/g);
    return all ? this.text.lastIndexOf(all[all.length - 1]) : 0;
  }

  get isEmptyOrWhitespace(): boolean {
    return this.firstNonWhitespaceCharacterIndex === this._text.length;
  }
}
