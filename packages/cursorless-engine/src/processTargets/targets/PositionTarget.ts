import { Range, TextEditor, UnsupportedError } from "@cursorless/common";
import { BaseTarget, CommonTargetParameters } from ".";
import { TargetPosition } from "@cursorless/common";
import { EditNewActionType } from "../../typings/target.types";
import { EditWithRangeUpdater } from "../../typings/Types";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: TargetPosition;
  readonly insertionDelimiter: string;
  readonly isRaw: boolean;
}

export default class PositionTarget extends BaseTarget {
  insertionDelimiter: string;
  isRaw: boolean;
  private position: TargetPosition;
  private isLineDelimiter: boolean;
  private isBefore: boolean;
  private indentationString: string;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
    this.insertionDelimiter = parameters.insertionDelimiter;
    this.isRaw = parameters.isRaw;
    this.isBefore = parameters.position === "before";
    // It's only considered a line if the delimiter is only new line symbols
    this.isLineDelimiter = /^(\n)+$/.test(parameters.insertionDelimiter);
    // This calculation must be done here since that that target is not updated by our range updater
    this.indentationString = this.isLineDelimiter
      ? getIndentationString(
          parameters.editor,
          parameters.thatTarget!.contentRange,
        )
      : "";
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;

  getRemovalRange = () => removalUnsupportedForPosition(this.position);

  getEditNewActionType(): EditNewActionType {
    if (
      this.insertionDelimiter === "\n" &&
      this.position === "after" &&
      this.state.thatTarget!.contentRange.isSingleLine
    ) {
      // If the target that we're wrapping is not a single line, then we
      // want to compute indentation based on the entire target.  Otherwise,
      // we allow the editor to determine how to perform indentation.
      // Note that we use `this.state.thatTarget` rather than `this.thatTarget`
      // because we don't really want the transitive `thatTarget` behaviour, as
      // it's not really the "that" target that we're after; it's the target that
      // we're wrapping.  Should rework this stuff as part of #803.
      return "insertLineAfter";
    }

    return "edit";
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    return this.position === "before" || this.position === "after"
      ? this.constructEditWithDelimiters(text)
      : this.constructEditWithoutDelimiters(text);
  }

  protected getCloneParameters(): PositionTargetParameters {
    return {
      ...this.state,
      position: this.position,
      insertionDelimiter: this.insertionDelimiter,
      isRaw: this.isRaw,
    };
  }

  private constructEditWithDelimiters(text: string): EditWithRangeUpdater {
    const range = this.getEditRange();
    const editText = this.getEditText(text);

    const updateRange = (range: Range) => {
      return this.updateRange(range, text);
    };

    return {
      range,
      text: editText,
      isReplace: this.position === "after",
      updateRange,
    };
  }

  private constructEditWithoutDelimiters(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  private getEditRange() {
    const position = (() => {
      if (this.isLineDelimiter) {
        const line = this.editor.document.lineAt(
          this.isBefore ? this.contentRange.start : this.contentRange.end,
        );
        return this.isBefore ? line.range.start : line.range.end;
      } else {
        return this.isBefore ? this.contentRange.start : this.contentRange.end;
      }
    })();
    return new Range(position, position);
  }

  private getEditText(text: string) {
    const insertionText = this.indentationString + text;

    return this.isBefore
      ? insertionText + this.insertionDelimiter
      : this.insertionDelimiter + insertionText;
  }

  private updateRange(range: Range, text: string) {
    const baseStartOffset = this.editor.document.offsetAt(range.start);
    const startIndex = this.isBefore
      ? baseStartOffset + this.indentationString.length
      : baseStartOffset +
        this.insertionDelimiter.length +
        this.indentationString.length;

    const endIndex = startIndex + text.length;

    return new Range(
      this.editor.document.positionAt(startIndex),
      this.editor.document.positionAt(endIndex),
    );
  }
}

export function removalUnsupportedForPosition(position: string): Range {
  const preferredModifier =
    position === "after" || position === "end" ? "trailing" : "leading";

  throw new UnsupportedError(
    `Please use "${preferredModifier}" modifier; removal is not supported for "${position}"`,
  );
}

/** Calculate the minimum indentation/padding for a range */
function getIndentationString(editor: TextEditor, range: Range) {
  let length = Number.MAX_SAFE_INTEGER;
  let indentationString = "";
  for (let i = range.start.line; i <= range.end.line; ++i) {
    const line = editor.document.lineAt(i);
    if (
      !line.isEmptyOrWhitespace &&
      line.firstNonWhitespaceCharacterIndex < length
    ) {
      length = line.firstNonWhitespaceCharacterIndex;
      indentationString = line.text.slice(0, length);
    }
  }
  return indentationString;
}
