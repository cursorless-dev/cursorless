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
    const index = clamp(value, 0, this.lineCount - 1);
    return this._lines[index];
  }

  offsetAt(position: Position): number {
    if (position.line < 0) {
      return 0;
    }
    if (position.line > this._lines.length - 1) {
      return this._text.length;
    }

    const line = this._lines[position.line];

    return line.offset + clamp(position.character, 0, line.text.length);
  }

  positionAt(offset: number): Position {
    if (offset <= 0) {
      return this.range.start;
    }
    if (offset >= this._text.length) {
      return this.range.end;
    }

    const line = this._lines.find(
      (line) => offset < line.offset + line.lengthIncludingEol,
    );

    if (line == null) {
      throw Error(`Couldn't find line for offset ${offset}`);
    }

    return new Position(
      line.lineNumber,
      Math.min(offset - line.offset, line.text.length),
    );
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
  let offset = 0;

  for (let i = 0; i < documentParts.length; i += 2) {
    const line = new InMemoryTextLine(
      result.length,
      offset,
      documentParts[i],
      documentParts[i + 1],
    );
    result.push(line);
    offset += line.lengthIncludingEol;
  }

  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
