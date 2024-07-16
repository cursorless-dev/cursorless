import {
  EndOfLine,
  Position,
  Range,
  TextDocument,
  TextLine,
} from "@cursorless/common";
import type { URI } from "vscode-uri";
import { InMemoryTextLine } from "./InMemoryTextLine";

export class InMemoryTextDocument implements TextDocument {
  private _version: number;
  private _eol: EndOfLine;
  private _text: string;
  private _lines: InMemoryTextLine[];
  readonly filename: string;

  constructor(
    public readonly uri: URI,
    public readonly languageId: string,
    text: string,
  ) {
    this.filename = uri.path.replace(/\\|\//g, "");
    this._text = "";
    this._eol = "LF";
    this._version = -1;
    this._lines = [];
    this.setTextInternal(text);
  }

  get version(): number {
    return this._version;
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
    const value =
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line;
    const index = Math.min(Math.max(value, 0), this._lines.length - 1);
    return this._lines[index];
  }

  offsetAt(position: Position): number {
    if (position.isBefore(this._lines[0].range.start)) {
      return 0;
    }
    if (position.isAfter(this._lines[this.lineCount - 1].range.end)) {
      return this._text.length;
    }

    let offset = 0;
    for (const line of this._lines) {
      if (position.line === line.lineNumber) {
        return offset + Math.min(position.character, line.range.end.character);
      }
      offset += line.text.length + line.eolLength;
    }

    throw Error(`Couldn't find offset for position ${position}`);
  }

  positionAt(offset: number): Position {
    if (offset < 0) {
      return this._lines[0].range.start;
    }
    if (offset >= this._text.length) {
      return this._lines[this.lineCount - 1].range.end;
    }

    let currentOffset = 0;
    for (const line of this._lines) {
      if (currentOffset + line.text.length >= offset) {
        return new Position(line.lineNumber, offset - currentOffset);
      }
      currentOffset += line.text.length + line.eolLength;
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

function createLines(text: string): InMemoryTextLine[] {
  const documentParts = text.split(/(\r?\n)/g);
  const result: InMemoryTextLine[] = [];

  for (let i = 0; i < documentParts.length; i += 2) {
    result.push(
      new InMemoryTextLine(
        result.length,
        documentParts[i],
        documentParts[i + 1],
      ),
    );
  }

  return result;
}
