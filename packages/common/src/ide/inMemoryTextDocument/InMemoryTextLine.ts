import { Position } from "../../types/Position";
import { Range } from "../../types/Range";
import type { TextLine } from "../../types/TextLine";
import { getLeadingWhitespace, getTrailingWhitespace } from "../../util/regex";

export class InMemoryTextLine implements TextLine {
  readonly range: Range;
  readonly rangeIncludingLineBreak: Range;
  readonly firstNonWhitespaceCharacterIndex: number;
  readonly lastNonWhitespaceCharacterIndex: number;
  readonly isEmptyOrWhitespace: boolean;
  readonly lengthIncludingEol: number;

  constructor(
    public lineNumber: number,
    public offset: number,
    public text: string,
    eol: string | undefined,
  ) {
    this.isEmptyOrWhitespace = /^\s*$/.test(text);
    this.lengthIncludingEol = text.length + (eol?.length ?? 0);
    const start = new Position(lineNumber, 0);
    const end = new Position(lineNumber, text.length);
    const endIncludingLineBreak =
      eol != null ? new Position(lineNumber + 1, 0) : end;
    this.firstNonWhitespaceCharacterIndex = getLeadingWhitespace(text).length;
    this.lastNonWhitespaceCharacterIndex =
      text.length - getTrailingWhitespace(text).length;
    this.range = new Range(start, end);
    this.rangeIncludingLineBreak = new Range(start, endIncludingLineBreak);
  }
}
