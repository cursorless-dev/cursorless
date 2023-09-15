/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position, Range, TextDocument, TextLine } from "..";

class MirrorTextModel {
  protected _uri: URI;
  protected _lines: string[];
  protected _eol: string;
  protected _versionId: number;
  protected _lineStarts: PrefixSumComputer | null;
  private _cachedTextValue: string | null;

  constructor(uri: URI, lines: string[], eol: string, versionId: number) {
    this._uri = uri;
    this._lines = lines;
    this._eol = eol;
    this._versionId = versionId;
    this._lineStarts = null;
    this._cachedTextValue = null;
  }

  get version(): number {
    return this._versionId;
  }

  getText(): string {
    if (this._cachedTextValue == null) {
      this._cachedTextValue = this._lines.join(this._eol);
    }
    return this._cachedTextValue;
  }

  protected _ensureLineStarts(): void {
    if (!this._lineStarts) {
      const eolLength = this._eol.length;
      const linesLength = this._lines.length;
      const lineStartValues = new Uint32Array(linesLength);
      for (let i = 0; i < linesLength; i++) {
        lineStartValues[i] = this._lines[i].length + eolLength;
      }
      this._lineStarts = new PrefixSumComputer(lineStartValues);
    }
  }
}

// was called ExtHostDocumentData
export class InMemoryTextDocument extends MirrorTextModel {
  private _document?: TextDocument;

  constructor(
    uri: URI,
    lines: string[],
    eol: string,
    versionId: number,
    private _languageId: string,
  ) {
    super(uri, lines, eol, versionId);
  }

  get document(): TextDocument {
    if (!this._document) {
      // TODO: can we get rid of the eslint-disable-line?
      const that = this; // eslint-disable-line
      this._document = {
        get uri() {
          return that._uri;
        },
        get languageId() {
          return that._languageId;
        },
        get version() {
          return that._versionId;
        },
        getText(range?) {
          return range ? that._getTextInRange(range) : that.getText();
        },
        get eol() {
          return that._eol === "\n" ? "LF" : "CRLF";
        },
        get lineCount() {
          return that._lines.length;
        },
        lineAt(lineOrPos: number | Position) {
          return that._lineAt(lineOrPos);
        },
        offsetAt(pos) {
          return that._offsetAt(pos);
        },
        positionAt(offset) {
          return that._positionAt(offset);
        },
        get range(): Range {
          return that._range();
        },
      };
    }
    return Object.freeze(this._document)!;
  }

  private _getTextInRange(_range: Range): string {
    const range = this._validateRange(_range);

    if (range.isEmpty) {
      return "";
    }

    if (range.isSingleLine) {
      return this._lines[range.start.line].substring(
        range.start.character,
        range.end.character,
      );
    }

    const lineEnding = this._eol,
      startLineIndex = range.start.line,
      endLineIndex = range.end.line,
      resultLines: string[] = [];

    resultLines.push(
      this._lines[startLineIndex].substring(range.start.character),
    );
    for (let i = startLineIndex + 1; i < endLineIndex; i++) {
      resultLines.push(this._lines[i]);
    }
    resultLines.push(
      this._lines[endLineIndex].substring(0, range.end.character),
    );

    return resultLines.join(lineEnding);
  }

  private _lineAt(lineOrPosition: number | Position): TextLine {
    let line: number | undefined;
    if (lineOrPosition instanceof Position) {
      line = lineOrPosition.line;
    } else if (typeof lineOrPosition === "number") {
      line = lineOrPosition;
    }

    if (
      typeof line !== "number" ||
      line < 0 ||
      line >= this._lines.length ||
      Math.floor(line) !== line
    ) {
      throw new Error("Illegal value for `line`");
    }

    return new ExtHostDocumentLine(
      line,
      this._lines[line],
      line === this._lines.length - 1,
    );
  }

  private _offsetAt(position: Position): number {
    position = this._validatePosition(position);
    this._ensureLineStarts();
    return (
      this._lineStarts!.getPrefixSum(position.line - 1) + position.character
    );
  }

  private _positionAt(offset: number): Position {
    offset = Math.floor(offset);
    offset = Math.max(0, offset);

    this._ensureLineStarts();
    const out = this._lineStarts!.getIndexOf(offset);

    const lineLength = this._lines[out.index].length;

    // Ensure we return a valid position
    return new Position(out.index, Math.min(out.remainder, lineLength));
  }

  private _range(): Range {
    return new Range(
      0,
      0,
      this._lines.length,
      this._lines[this._lines.length - 1].length,
    );
  }

  // ---- range math

  private _validateRange(range: Range): Range {
    if (!(range instanceof Range)) {
      throw new Error("Invalid argument");
    }

    const start = this._validatePosition(range.start);
    const end = this._validatePosition(range.end);

    if (start === range.start && end === range.end) {
      return range;
    }
    return new Range(start.line, start.character, end.line, end.character);
  }

  private _validatePosition(position: Position): Position {
    if (!(position instanceof Position)) {
      throw new Error("Invalid argument");
    }

    if (this._lines.length === 0) {
      return position.with(0, 0);
    }

    let { line, character } = position;
    let hasChanged = false;

    if (line < 0) {
      line = 0;
      character = 0;
      hasChanged = true;
    } else if (line >= this._lines.length) {
      line = this._lines.length - 1;
      character = this._lines[line].length;
      hasChanged = true;
    } else {
      const maxCharacter = this._lines[line].length;
      if (character < 0) {
        character = 0;
        hasChanged = true;
      } else if (character > maxCharacter) {
        character = maxCharacter;
        hasChanged = true;
      }
    }

    if (!hasChanged) {
      return position;
    }
    return new Position(line, character);
  }
}

export class ExtHostDocumentLine implements TextLine {
  private readonly _line: number;
  private readonly _text: string;
  private readonly _isLastLine: boolean;

  constructor(line: number, text: string, isLastLine: boolean) {
    this._line = line;
    this._text = text;
    this._isLastLine = isLastLine;
  }

  public get lineNumber(): number {
    return this._line;
  }

  public get text(): string {
    return this._text;
  }

  public get range(): Range {
    return new Range(this._line, 0, this._line, this._text.length);
  }

  public get rangeIncludingLineBreak(): Range {
    if (this._isLastLine) {
      return this.range;
    }
    return new Range(this._line, 0, this._line + 1, 0);
  }

  public get firstNonWhitespaceCharacterIndex(): number {
    //TODO@api, rename to 'leadingWhitespaceLength'
    return /^(\s*)/.exec(this._text)![1].length;
  }

  public get isEmptyOrWhitespace(): boolean {
    return this.firstNonWhitespaceCharacterIndex === this._text.length;
  }

  public get lastNonWhitespaceCharacterIndex(): number {
    const all = this.text.match(/\S/g);
    return all ? this.text.lastIndexOf(all[all.length - 1]) : 0;
  }
}

import { URI } from "vscode-uri";

export function toUint32(v: number): number {
  if (v < 0) {
    return 0;
  }
  const maxUint32 = 4294967295; // 2^32 - 1
  if (v > maxUint32) {
    return maxUint32;
  }
  return v | 0;
}

export class PrefixSumComputer {
  /**
   * values[i] is the value at index i
   */
  private values: Uint32Array;

  /**
   * prefixSum[i] = SUM(heights[j]), 0 <= j <= i
   */
  private prefixSum: Uint32Array;

  /**
   * prefixSum[i], 0 <= i <= prefixSumValidIndex can be trusted
   */
  private readonly prefixSumValidIndex: Int32Array;

  constructor(values: Uint32Array) {
    this.values = values;
    this.prefixSum = new Uint32Array(values.length);
    this.prefixSumValidIndex = new Int32Array(1);
    this.prefixSumValidIndex[0] = -1;
  }

  public getCount(): number {
    return this.values.length;
  }

  public getTotalSum(): number {
    if (this.values.length === 0) {
      return 0;
    }
    return this._getPrefixSum(this.values.length - 1);
  }

  /**
   * Returns the sum of the first `index + 1` many items.
   * @returns `SUM(0 <= j <= index, values[j])`.
   */
  public getPrefixSum(index: number): number {
    if (index < 0) {
      return 0;
    }

    index = toUint32(index);
    return this._getPrefixSum(index);
  }

  private _getPrefixSum(index: number): number {
    if (index <= this.prefixSumValidIndex[0]) {
      return this.prefixSum[index];
    }

    let startIndex = this.prefixSumValidIndex[0] + 1;
    if (startIndex === 0) {
      this.prefixSum[0] = this.values[0];
      startIndex++;
    }

    if (index >= this.values.length) {
      index = this.values.length - 1;
    }

    for (let i = startIndex; i <= index; i++) {
      this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
    }
    this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
    return this.prefixSum[index];
  }

  public getIndexOf(sum: number): PrefixSumIndexOfResult {
    sum = Math.floor(sum);

    // Compute all sums (to get a fully valid prefixSum)
    this.getTotalSum();

    let low = 0;
    let high = this.values.length - 1;
    let mid = 0;
    let midStop = 0;
    let midStart = 0;

    while (low <= high) {
      mid = (low + (high - low) / 2) | 0;

      midStop = this.prefixSum[mid];
      midStart = midStop - this.values[mid];

      if (sum < midStart) {
        high = mid - 1;
      } else if (sum >= midStop) {
        low = mid + 1;
      } else {
        break;
      }
    }

    return new PrefixSumIndexOfResult(mid, sum - midStart);
  }
}

export class PrefixSumIndexOfResult {
  _prefixSumIndexOfResultBrand: void = undefined;

  constructor(
    public readonly index: number,
    public readonly remainder: number,
  ) {
    this.index = index;
    this.remainder = remainder;
  }
}
