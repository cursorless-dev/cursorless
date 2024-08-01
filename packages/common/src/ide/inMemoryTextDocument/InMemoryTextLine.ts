import { Position } from "../../types/Position";
import { Range } from "../../types/Range";
import type { TextLine } from "../../types/TextLine";
import { getLeadingWhitespace, getTrailingWhitespace } from "../../util/regex";

export class InMemoryTextLine implements TextLine {
  readonly isEmptyOrWhitespace: boolean;
  readonly range: Range;
  readonly rangeIncludingLineBreak: Range;
  readonly rangeTrimmed: Range | undefined;
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
    this.range = new Range(start, end);
    this.rangeIncludingLineBreak = new Range(start, endIncludingLineBreak);
    this.rangeTrimmed = this.isEmptyOrWhitespace
      ? undefined
      : new Range(
          start.translate(undefined, getLeadingWhitespace(text).length),
          end.translate(undefined, -getTrailingWhitespace(text).length),
        );
  }
}
