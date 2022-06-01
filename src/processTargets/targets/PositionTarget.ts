import * as vscode from "vscode";
import { Range, TextEditor } from "vscode";
import { Position, Target } from "../../typings/target.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import BaseTarget, { CommonTargetParameters } from "./BaseTarget";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly insertionDelimiter: string;
  readonly isRaw: boolean;
  readonly removalTarget: Target | undefined;
}

export default class PositionTarget extends BaseTarget {
  insertionDelimiter: string;
  isRaw: boolean;
  private position: Position;
  private removalTarget: Target | undefined;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
    this.insertionDelimiter = parameters.insertionDelimiter;
    this.isRaw = parameters.isRaw;
    this.removalTarget = parameters.removalTarget;
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () =>
    this.removalTarget?.getRemovalRange() ?? this.contentRange;

  constructChangeEdit(text: string): EditWithRangeUpdater {
    if (this.isInsertion()) {
      return this.constructInsertionEdit(text, true);
    }
    return this.constructReplaceEdit(text);
  }

  constructEmptyChangeEdit(): EditWithRangeUpdater {
    if (this.isInsertion()) {
      return this.constructInsertionEdit("", false);
    }
    return this.constructReplaceEdit("");
  }

  protected getCloneParameters(): PositionTargetParameters {
    return {
      ...this.state,
      position: this.position,
      insertionDelimiter: this.insertionDelimiter,
      isRaw: this.isRaw,
      removalTarget: this.removalTarget,
    };
  }

  private constructInsertionEdit(
    text: string,
    useLinePadding: boolean
  ): EditWithRangeUpdater {
    const delimiter = this.insertionDelimiter;
    const isLine = delimiter.includes("\n");
    const isBefore = this.position === "before";

    const range = getEditRange(
      this.editor,
      this.contentRange,
      isLine,
      useLinePadding,
      isBefore
    );
    const padding =
      isLine && useLinePadding
        ? getLinePadding(this.editor, range, isBefore)
        : "";

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
      range: range,
      text: editText,
      isReplace: this.position === "after",
      updateRange,
    };
  }

  private constructReplaceEdit(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  private isInsertion() {
    return this.position === "before" || this.position === "after";
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
  useLinePadding: boolean,
  isBefore: boolean
) {
  let position: vscode.Position;
  if (isLine) {
    const line = editor.document.lineAt(isBefore ? range.start : range.end);
    if (isBefore) {
      position = useLinePadding
        ? line.isEmptyOrWhitespace
          ? range.start
          : new vscode.Position(
              line.lineNumber,
              line.firstNonWhitespaceCharacterIndex
            )
        : line.range.start;
    } else {
      position = line.range.end;
    }
  } else {
    position = isBefore ? range.start : range.end;
  }
  return new Range(position, position);
}
