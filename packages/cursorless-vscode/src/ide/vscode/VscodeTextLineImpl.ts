import type { TextLine } from "@cursorless/common";
import { Position, Range } from "@cursorless/common";
import { fromVscodeRange } from "@cursorless/vscode-common";
import type * as vscode from "vscode";

export default class VscodeTextLineImpl implements TextLine {
  constructor(private line: vscode.TextLine) {}

  get lineNumber(): number {
    return this.line.lineNumber;
  }

  get text(): string {
    return this.line.text;
  }

  get range(): Range {
    return fromVscodeRange(this.line.range);
  }

  get rangeIncludingLineBreak(): Range {
    return fromVscodeRange(this.line.rangeIncludingLineBreak);
  }

  get rangeTrimmed(): Range | undefined {
    return this.line.isEmptyOrWhitespace
      ? undefined
      : new Range(
          new Position(
            this.lineNumber,
            this.line.firstNonWhitespaceCharacterIndex,
          ),
          new Position(this.lineNumber, this.line.text.trimEnd().length),
        );
  }

  get isEmptyOrWhitespace(): boolean {
    return this.line.isEmptyOrWhitespace;
  }
}
