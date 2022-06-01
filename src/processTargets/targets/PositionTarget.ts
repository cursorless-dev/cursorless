import * as vscode from "vscode";
import { Range, TextEditor } from "vscode";
import { Position } from "../../typings/target.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly delimiter?: string;
}

export default class PositionTarget extends BaseTarget {
  delimiterString: string;
  private position: Position;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
    this.delimiterString = parameters.delimiter ?? "";
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  private constructReplaceEdit(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  private constructInsertionEdit(text: string): EditWithRangeUpdater {
    const delimiter = this.delimiterString!;
    const isLine = delimiter.includes("\n");
    const isBefore = this.position === "before";

    const range = getEditRange(
      this.editor,
      this.contentRange,
      isLine,
      isBefore
    );
    const padding = isLine ? getLinePadding(this.editor, range, isBefore) : "";

    const editText = isBefore
      ? text + delimiter + padding
      : delimiter + padding + text;

    const updateRange = (range: Range) => {
      const startOffset = this.editor.document.offsetAt(range.start);
      const startIndex = isBefore
        ? startOffset
        : startOffset + delimiter.length + padding.length;
      const endIndex = startIndex + text.length;
      return new Range(
        this.editor.document.positionAt(startIndex),
        this.editor.document.positionAt(endIndex)
      );
    };

    return {
      range: this.contentRange,
      text: editText,
      isReplace: this.position === "after",
      updateRange,
    };
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    if (
      this.delimiterString != null &&
      (this.position === "before" || this.position === "after")
    ) {
      return this.constructInsertionEdit(text);
    }
    return this.constructReplaceEdit(text);
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      position: this.position,
    };
  }
}

function getLinePadding(editor: TextEditor, range: Range, isBefore: boolean) {
  const line = editor.document.lineAt(isBefore ? range.start : range.end);
  const characterIndex = line.isEmptyOrWhitespace
    ? range.start.character
    : line.firstNonWhitespaceCharacterIndex;
  return line.text.slice(0, characterIndex);
}

function getEditRange(
  editor: TextEditor,
  range: Range,
  isLine: boolean,
  isBefore: boolean
) {
  let position: vscode.Position;
  if (isLine) {
    const line = editor.document.lineAt(isBefore ? range.start : range.end);
    if (isBefore) {
      position = line.isEmptyOrWhitespace
        ? range.start
        : new vscode.Position(
            line.lineNumber,
            line.firstNonWhitespaceCharacterIndex
          );
    } else {
      position = line.range.end;
    }
  } else {
    position = isBefore ? range.start : range.end;
  }
  return new Range(position, position);
}
