import * as vscode from "vscode";
import { Range, TextEditor } from "vscode";
import { UnsupportedError } from "../../errors";
import { EditNewContext } from "../../typings/target.types";
import { Position } from "../../typings/targetDescriptor.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import { BaseTarget, CommonTargetParameters } from ".";

interface PositionTargetParameters extends CommonTargetParameters {
  readonly position: Position;
  readonly insertionDelimiter: string;
  readonly isRaw: boolean;
}

export default class PositionTarget extends BaseTarget {
  insertionDelimiter: string;
  isRaw: boolean;
  private position: Position;
  private linePadding: string;

  constructor(parameters: PositionTargetParameters) {
    super(parameters);
    this.position = parameters.position;
    this.insertionDelimiter = parameters.insertionDelimiter;
    this.isRaw = parameters.isRaw;
    this.linePadding = getLinePadding(
      parameters.editor,
      parameters.thatTarget!.contentRange
    );
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;

  getRemovalRange = () => removalUnsupportedForPosition(this.position);

  protected getCloneParameters(): PositionTargetParameters {
    return {
      ...this.state,
      position: this.position,
      insertionDelimiter: this.insertionDelimiter,
      isRaw: this.isRaw,
    };
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    return this.position === "before" || this.position === "after"
      ? this.constructEditWithDelimiters(text)
      : this.constructEditWithoutDelimiters(text);
  }

  private constructEditWithDelimiters(text: string): EditWithRangeUpdater {
    const delimiter = this.insertionDelimiter;
    // It's only considered a line if the delimiter is only new line symbols
    const isLine = /^(\n)+$/.test(delimiter);
    const isBefore = this.position === "before";

    const range = getEditRange(
      this.editor,
      this.contentRange,
      isLine,
      isBefore
    );

    const editText = (() => {
      if (isLine) {
        return isBefore
          ? this.linePadding + text + delimiter
          : delimiter + this.linePadding + text;
      }
      return isBefore ? text + delimiter : delimiter + text;
    })();

    const updateRange = (range: Range) => {
      const startIndex = (() => {
        if (isLine) {
          const line = this.editor.document.lineAt(
            isBefore ? range.end : range.start
          );
          const startOffset = this.editor.document.offsetAt(
            isBefore ? line.range.start : line.range.end
          );
          return isBefore
            ? startOffset - delimiter.length - text.length
            : startOffset + delimiter.length + this.linePadding.length;
        }
        const startOffset = this.editor.document.offsetAt(range.start);
        return isBefore ? startOffset : startOffset + delimiter.length;
      })();
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

  private constructEditWithoutDelimiters(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  getEditNewContext(): EditNewContext {
    if (this.insertionDelimiter === "\n" && this.position === "after") {
      return { type: "command", command: "editor.action.insertLineAfter" };
    }

    return {
      type: "edit",
    };
  }
}

export function removalUnsupportedForPosition(position: string): Range {
  const preferredModifier =
    position === "after" || position === "end" ? "trailing" : "leading";

  throw new UnsupportedError(
    `Please use "${preferredModifier}" modifier; removal is not supported for "${position}"`
  );
}

function getLinePadding(editor: TextEditor, range: Range) {
  let length = Number.MAX_SAFE_INTEGER;
  let padding = "";
  for (let i = range.start.line; i <= range.end.line; ++i) {
    const line = editor.document.lineAt(i);
    const characterIndex = line.isEmptyOrWhitespace
      ? line.range.start.character
      : line.firstNonWhitespaceCharacterIndex;
    if (characterIndex < length) {
      length = characterIndex;
      padding = line.text.slice(0, characterIndex);
    }
  }
  return padding;
}

function getEditRange(
  editor: TextEditor,
  range: Range,
  isLine: boolean,
  isBefore: boolean
) {
  const position = (() => {
    if (isLine) {
      const line = editor.document.lineAt(isBefore ? range.start : range.end);
      return isBefore ? line.range.start : line.range.end;
    } else {
      return isBefore ? range.start : range.end;
    }
  })();
  return new Range(position, position);
}
