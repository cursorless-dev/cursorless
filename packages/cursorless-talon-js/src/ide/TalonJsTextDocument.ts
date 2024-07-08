import {
  EndOfLine,
  Position,
  Range,
  TextDocument,
  TextLine,
} from "@cursorless/common";
import {
  getLeadingWhitespace,
  getTrailingWhitespace,
} from "@cursorless/cursorless-engine";
import type { URI } from "vscode-uri";

export class TalonJsTextDocument implements TextDocument {
  version: number;
  eol: EndOfLine;
  private lines: TextLine[];

  constructor(
    public readonly uri: URI,
    public readonly languageId: string,
    private content: string,
  ) {
    this.version = 0;
    this.eol = content.includes("\r\n") ? "CRLF" : "LF";
    this.lines = createLines(content, this.eol);
  }

  get lineCount(): number {
    return this.lines.length;
  }

  get range(): Range {
    const { end } = this.lines[this.lines.length - 1].range;
    return new Range(0, 0, end.line, end.character);
  }

  lineAt(lineOrPosition: number | Position): TextLine {
    const index = Math.min(
      typeof lineOrPosition === "number" ? lineOrPosition : lineOrPosition.line,
      this.lines.length - 1,
    );
    return this.lines[index];
  }

  offsetAt(position: Position): number {
    throw new Error("Method not implemented.");
  }

  positionAt(offset: number): Position {
    throw new Error("Method not implemented.");
  }

  getText(range?: Range | undefined): string {
    throw new Error("Method not implemented.");
  }
}

function createLines(content: string, eol: EndOfLine): TextLine[] {
  const lines = content.split(/\r\n|\n/);
  const eolLength = eol === "CRLF" ? 2 : 1;
  const result: TextLine[] = [];

  for (const line of lines) {
    const start = new Position(result.length, 0);
    const end = new Position(start.line, line.length);
    const endIncludingLineBreak = new Position(
      start.line,
      line.length + eolLength,
    );
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
