import { URI } from "vscode-uri";
import {
  EndOfLine,
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorOptions,
  TextLine,
} from "..";

// See the TextLine, TextEditor, and TextDocument interfaces
// for documentation of these classes and their fields.

export class MockTextLine implements TextLine {
  readonly lineNumber: number;
  readonly text: string;
  readonly range: Range;
  readonly rangeIncludingLineBreak: Range;
  readonly firstNonWhitespaceCharacterIndex: number;
  readonly lastNonWhitespaceCharacterIndex: number;
  readonly isEmptyOrWhitespace: boolean;

  constructor(lineNumber: number, text: string) {
    if (lineNumber < 0) {
      throw new Error("lineNumber must be non-negative");
    }
    this.lineNumber = lineNumber;
    // capture any trailing \r\n or \n as eol (possibly neither is present)
    const eol = text.match(/(\r?\n)$/)?.[1] ?? "";
    if (eol.length > 0) {
      this.text = text.slice(0, -eol.length);
    } else {
      this.text = text;
    }
    this.range = new Range(
      this.lineNumber,
      0,
      this.lineNumber,
      this.text.length,
    );
    this.rangeIncludingLineBreak = new Range(
      this.lineNumber,
      0,
      this.lineNumber,
      this.text.length + eol.length,
    );
    const first = this.text.search(/\S/);
    this.firstNonWhitespaceCharacterIndex =
      first === -1 ? this.text.length : first;
    const all = this.text.match(/\S/g);
    this.lastNonWhitespaceCharacterIndex = all
      ? this.text.lastIndexOf(all[all.length - 1])
      : 0;
    this.isEmptyOrWhitespace =
      this.firstNonWhitespaceCharacterIndex === this.text.length;
  }
}

export class MockTextDocument implements TextDocument {
  readonly uri: URI;
  readonly languageId: string;
  readonly version: number;
  readonly range: Range;
  readonly eol: EndOfLine;
  private lines: MockTextLine[];
  private contents: string;

  constructor(filename: string, languageId: string, contents: string) {
    this.uri = URI.file(filename);
    this.languageId = languageId;
    this.version = 1;
    this.contents = contents;
    const rawLines: string[] = contents.match(/[^\n]*\n|[^\n]+/g) ?? [];
    this.lines = rawLines.map((line, i) => {
      return new MockTextLine(i, line);
    });
    if (this.lines.length === 0) {
      this.range = new Range(0, 0, 0, 0);
    } else {
      const lastLineRange = this.lines[this.lines.length - 1].range;
      this.range = new Range(
        0,
        0,
        lastLineRange.end.line,
        lastLineRange.end.character,
      );
    }
    this.eol = "LF";
  }

  get lineCount(): number {
    return this.lines.length;
  }

  public lineAt(x: number | Position): TextLine {
    if (typeof x === "number") {
      return this.lines[x];
    }
    return this.lines[x.line];
  }

  public offsetAt(position: Position): number {
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += this.lineAt(i).rangeIncludingLineBreak.end.character;
    }
    offset += position.character;
    return offset;
  }

  public positionAt(offset: number): Position {
    let line = 0;
    while (offset >= this.lineAt(line).rangeIncludingLineBreak.end.character) {
      offset -= this.lineAt(line).rangeIncludingLineBreak.end.character;
      line++;
    }
    return new Position(line, offset);
  }

  public getText(range?: Range): string {
    if (range === undefined) {
      return this.contents;
    }
    const startOffset = this.offsetAt(range.start);
    const endOffset = this.offsetAt(range.end);
    return this.contents.slice(startOffset, endOffset);
  }
}

export class MockTextEditor implements TextEditor {
  public primarySelection: Selection;
  readonly id: string;
  readonly document: TextDocument;
  readonly options: TextEditorOptions;
  readonly isActive: boolean;

  constructor(document: TextDocument, active: boolean) {
    this.id = document.uri.toString();
    this.document = document;
    this.primarySelection = new Selection(0, 0, 0, 0);
    this.options = new DefaultTextEditorOptions();
    this.isActive = active;
    // TODO: support visible ranges, multiple selections, options
  }

  get visibleRanges(): Range[] {
    return [this.document.range];
  }

  get selections(): Selection[] {
    return [this.primarySelection];
  }

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }
}

class DefaultTextEditorOptions implements TextEditorOptions {
  get tabSize(): number | string {
    return 4;
  }

  get insertSpaces(): boolean | string {
    return true;
  }
}
