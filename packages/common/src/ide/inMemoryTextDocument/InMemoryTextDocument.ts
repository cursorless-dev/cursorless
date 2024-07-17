import type { URI } from "vscode-uri";
import type { Edit } from "../../types/Edit";
import { Position } from "../../types/Position";
import { Range } from "../../types/Range";
import type { TextDocument } from "../../types/TextDocument";
import type { TextLine } from "../../types/TextLine";
import type { TextDocumentContentChangeEvent } from "../types/Events";
import type { EndOfLine } from "../types/ide.types";
import { InMemoryTextLine } from "./InMemoryTextLine";
import { performEdits } from "./performEdits";

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
    this.filename = uri.path.split(/\\|\//g).at(-1) ?? "";
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
    return new Range(this._lines[0].range.start, this._lines.at(-1)!.range.end);
  }

  private setTextInternal(text: string): void {
    this._text = text;
    this._eol = text.includes("\r\n") ? "CRLF" : "LF";
    this._version++;
    this._lines = createLines(text);
  }

  lineAt(lineOrPosition: number | Position): TextLine {
    const value =
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line;
    const index = Math.min(Math.max(value, 0), this.lineCount - 1);
    return this._lines[index];
  }

  offsetAt(position: Position): number {
    if (position.isBefore(this._lines[0].range.start)) {
      return 0;
    }
    if (position.isAfter(this._lines.at(-1)!.range.end)) {
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
      return this._lines.at(-1)!.range.end;
    }

    let currentOffset = 0;

    for (const line of this._lines) {
      if (currentOffset + line.text.length >= offset) {
        return new Position(line.lineNumber, offset - currentOffset);
      }
      currentOffset += line.text.length + line.eolLength;
    }

    throw Error(`Couldn't find position for offset ${offset}`);
  }

  getText(range?: Range): string {
    if (range == null) {
      return this.text;
    }
    const startOffset = this.offsetAt(range.start);
    const endOffset = this.offsetAt(range.end);
    return this.text.slice(startOffset, endOffset);
  }

  edit(edits: Edit[]): TextDocumentContentChangeEvent[] {
    const { text, changes } = performEdits(this, edits);
    this.setTextInternal(text);
    return changes;
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
