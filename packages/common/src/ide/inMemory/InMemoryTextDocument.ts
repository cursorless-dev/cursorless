import {
  EndOfLine,
  Position,
  Range,
  TextDocument,
  TextLine,
  getLeadingWhitespace,
  getTrailingWhitespace,
} from "@cursorless/common";
import type { URI } from "vscode-uri";

export class InMemoryTextDocument implements TextDocument {
  private _version: number;
  private _eol: EndOfLine;
  private _text: string;
  private _lines: TextLine[];

  constructor(
    public readonly uri: URI,
    public readonly languageId: string,
    text: string,
  ) {
    this._text = "";
    this._eol = "LF";
    this._version = -1;
    this._lines = [];
    this.setTextInternal(text);
  }

  readonly filename: string = "untitled";

  get version(): number {
    return this.version;
  }

  get lineCount(): number {
    return this._lines.length;
  }

  get eol(): EndOfLine {
    return this._eol;
  }

  get text(): string {
    return this._text;
  }

  get range(): Range {
    const { end } = this._lines[this._lines.length - 1].range;
    return new Range(0, 0, end.line, end.character);
  }

  setTextInternal(text: string): void {
    this._text = text;
    this._eol = text.includes("\r\n") ? "CRLF" : "LF";
    this._version++;
    this._lines = createLines(text);
  }

  lineAt(lineOrPosition: number | Position): TextLine {
    const index = Math.min(
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line,
      this._lines.length - 1,
    );
    return this._lines[index];
  }

  offsetAt(position: Position): number {
    let offset = 0;
    for (const line of this._lines) {
      if (position.line === line.lineNumber) {
        return offset + Math.min(position.character, line.range.end.character);
      }
      offset += line.text.length + 1;
    }
    return offset;
  }

  positionAt(offset: number): Position {
    let currentOffset = 0;
    for (const line of this._lines) {
      if (currentOffset + line.text.length >= offset) {
        return new Position(line.lineNumber, offset - currentOffset);
      }
      currentOffset += line.text.length;
    }
    return this._lines[this._lines.length - 1].range.end;
  }

  getText(range?: Range): string {
    if (range == null) {
      return this.text;
    }
    const startOffset = this.offsetAt(range.start);
    const endOffset = this.offsetAt(range.end);
    return this.text.slice(startOffset, endOffset);
  }
}

function createLines(text: string): TextLine[] {
  const lines = text.split(/\r?\n/g);
  const result: TextLine[] = [];

  for (const line of lines) {
    const start = new Position(result.length, 0);
    const end = new Position(start.line, line.length);
    const endIncludingLineBreak = new Position(start.line + 1, 0);
    const firstNonWhitespaceCharacterIndex = getLeadingWhitespace(line).length;
    const lastNonWhitespaceCharacterIndex =
      line.length - getTrailingWhitespace(line).length;
    const isEmptyOrWhitespace = /^\s*$/.test(line);
    result.push({
      lineNumber: start.line,
      text: line,
      range: new Range(start, end),
      rangeIncludingLineBreak: new Range(start, endIncludingLineBreak),
      firstNonWhitespaceCharacterIndex,
      lastNonWhitespaceCharacterIndex,
      isEmptyOrWhitespace,
    });
  }

  return result;
}
