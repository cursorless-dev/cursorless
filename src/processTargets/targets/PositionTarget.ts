import { Position as VS_Position, Range, TextEditor } from "vscode";
import { Position, Target, TargetType } from "../../typings/target.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
} from "./BaseTarget";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly delimiter?: string;
}

export default class PositionTarget extends BaseTarget {
  private position_: Position;
  private delimiter_: string | undefined;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position_ = parameters.position;
    this.delimiter_ = parameters.delimiter;
  }

  get type(): TargetType {
    return "position";
  }
  get delimiter() {
    return this.delimiter_;
  }
  get position() {
    return this.position_;
  }

  getLeadingDelimiterRange() {
    return undefined;
  }
  getTrailingDelimiterRange() {
    return undefined;
  }

  private constructReplaceEdit(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  private constructInsertionEdit(text: string): EditWithRangeUpdater {
    const delimiter = this.delimiter!;
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
      this.delimiter != null &&
      (this.position === "before" || this.position === "after")
    ) {
      return this.constructInsertionEdit(text);
    }
    return this.constructReplaceEdit(text);
  }

  cloneWith(parameters: CloneWithParameters) {
    return new PositionTarget({
      ...this.getCloneParameters(),
      ...parameters,
    });
  }

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
      return new PositionTarget({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      position: this.position_,
      delimiter: this.delimiter_,
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
  let position: VS_Position;
  if (isLine) {
    const line = editor.document.lineAt(isBefore ? range.start : range.end);
    if (isBefore) {
      position = line.isEmptyOrWhitespace
        ? range.start
        : new VS_Position(
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
