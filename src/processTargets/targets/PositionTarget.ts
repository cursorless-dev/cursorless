import { Range, TextEditor } from "vscode";
import { BaseTarget, CommonTargetParameters } from ".";
import { UnsupportedError } from "../../errors";
import { EditNewContext } from "../../typings/target.types";
import { Position } from "../../typings/targetDescriptor.types";
import { EditWithRangeUpdater } from "../../typings/Types";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly insertionDelimiter: string;
  readonly isRaw: boolean;
}

export default class PositionTarget extends BaseTarget {
  insertionDelimiter: string;
  isRaw: boolean;
  private position: Position;
  private isLineDelimiter: boolean;
  private isBefore: boolean;
  private linePadding: string;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
    this.insertionDelimiter = parameters.insertionDelimiter;
    this.isRaw = parameters.isRaw;
    this.isBefore = parameters.position === "before";
    // It's only considered a line if the delimiter is only new line symbols
    this.isLineDelimiter = /^(\n)+$/.test(parameters.insertionDelimiter);
    // This calculation must be done here since that that target is not updated by our range updater
    this.linePadding = this.isLineDelimiter
      ? getLinePadding(parameters.editor, parameters.thatTarget!.contentRange)
      : "";
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;

  getRemovalRange = () => removalUnsupportedForPosition(this.position);

  getEditNewContext(): EditNewContext {
    if (this.insertionDelimiter === "\n" && this.position === "after") {
      return { type: "command", command: "editor.action.insertLineAfter" };
    }

    return {
      type: "edit",
    };
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
      range: range,
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
          this.isBefore ? this.contentRange.start : this.contentRange.end
        );
        return this.isBefore ? line.range.start : line.range.end;
      } else {
        return this.isBefore ? this.contentRange.start : this.contentRange.end;
      }
    })();
    return new Range(position, position);
  }

  private getEditText(text: string) {
    if (this.isLineDelimiter) {
      return this.isBefore
        ? this.linePadding + text + this.insertionDelimiter
        : this.insertionDelimiter + this.linePadding + text;
    }
    return this.isBefore
      ? text + this.insertionDelimiter
      : this.insertionDelimiter + text;
  }

  private updateRange(range: Range, text: string) {
    const startIndex = (() => {
      if (this.isLineDelimiter) {
        const line = this.editor.document.lineAt(
          this.isBefore ? range.end : range.start
        );
        const startOffset = this.editor.document.offsetAt(
          this.isBefore ? line.range.start : line.range.end
        );
        return this.isBefore
          ? startOffset - this.insertionDelimiter.length - text.length
          : startOffset +
              this.insertionDelimiter.length +
              this.linePadding.length;
      }
      const startOffset = this.editor.document.offsetAt(range.start);
      return this.isBefore
        ? startOffset
        : startOffset + this.insertionDelimiter.length;
    })();
    const endIndex = startIndex + text.length;
    return new Range(
      this.editor.document.positionAt(startIndex),
      this.editor.document.positionAt(endIndex)
    );
  }
}

export function removalUnsupportedForPosition(position: string): Range {
  const preferredModifier =
    position === "after" || position === "end" ? "trailing" : "leading";

  throw new UnsupportedError(
    `Please use "${preferredModifier}" modifier; removal is not supported for "${position}"`
  );
}

/** Calculate the minimum indentation/padding for a range */
function getLinePadding(editor: TextEditor, range: Range) {
  let length = Number.MAX_SAFE_INTEGER;
  let padding = "";
  for (let i = range.start.line; i <= range.end.line; ++i) {
    const line = editor.document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    if (line.firstNonWhitespaceCharacterIndex < length) {
      length = line.firstNonWhitespaceCharacterIndex;
      padding = line.text.slice(0, length);
    }
  }
  return padding;
}
