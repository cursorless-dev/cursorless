import {
  InsertionMode,
  Range,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { EditWithRangeUpdater } from "../../typings/Types";
import {
  Destination,
  EditNewActionType,
  Target,
} from "../../typings/target.types";

export class DestinationImpl implements Destination {
  public readonly contentRange: Range;
  private readonly isLineDelimiter: boolean;
  private readonly isBefore: boolean;
  private readonly indentationString: string;

  constructor(
    public readonly target: Target,
    public readonly insertionMode: InsertionMode,
    indentationString?: string,
  ) {
    this.contentRange = getContentRange(target.contentRange, insertionMode);
    this.isBefore = insertionMode === "before";
    // It's only considered a line if the delimiter is only new line symbols
    this.isLineDelimiter = /^(\n)+$/.test(target.insertionDelimiter);
    this.indentationString =
      indentationString ?? this.isLineDelimiter
        ? getIndentationString(target.editor, target.contentRange)
        : "";
  }

  get contentSelection(): Selection {
    return this.contentRange.toSelection(this.target.isReversed);
  }

  get editor(): TextEditor {
    return this.target.editor;
  }

  get insertionDelimiter(): string {
    return this.target.insertionDelimiter;
  }

  get isRaw(): boolean {
    return this.target.isRaw;
  }

  /**
   * Creates a new destination with the given target while preserving insertion
   * mode and indentation string from this destination. This is important
   * because our "edit new" code updates the content range of the target when
   * multiple edits are performed in the same document, but we want to insert
   * the original indentation.
   */
  withTarget(target: Target): Destination {
    return new DestinationImpl(
      target,
      this.insertionMode,
      this.indentationString,
    );
  }

  getEditNewActionType(): EditNewActionType {
    if (
      this.insertionDelimiter === "\n" &&
      this.insertionMode === "after" &&
      this.target.contentRange.isSingleLine
    ) {
      // If the target that we're wrapping is not a single line, then we
      // want to compute indentation based on the entire target.  Otherwise,
      // we allow the editor to determine how to perform indentation.
      return "insertLineAfter";
    }

    return "edit";
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    return this.insertionMode === "before" || this.insertionMode === "after"
      ? this.constructEditWithDelimiters(text)
      : this.constructEditWithoutDelimiters(text);
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
      isReplace: this.insertionMode === "after",
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
        this.getLengthOfInsertionDelimiter() +
        this.indentationString.length;

    const endIndex = startIndex + text.length;

    return new Range(
      this.editor.document.positionAt(startIndex),
      this.editor.document.positionAt(endIndex),
    );
  }

  private getLengthOfInsertionDelimiter(): number {
    // Went inserting a new line with eol `CRLF` each `\n` will be converted to
    // `\r\n` and therefore the length is doubled.
    if (this.editor.document.eol === "CRLF") {
      // This function is only called when inserting after a range. Therefore we
      // only care about leading new lines in the insertion delimiter.
      const match = this.insertionDelimiter.match(/^\n+/);
      const nlCount = match?.[0].length ?? 0;
      return this.insertionDelimiter.length + nlCount;
    }
    return this.insertionDelimiter.length;
  }
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

function getContentRange(
  contentRange: Range,
  insertionMode: InsertionMode,
): Range {
  switch (insertionMode) {
    case "before":
      return contentRange.start.toEmptyRange();
    case "after":
      return contentRange.end.toEmptyRange();
    case "to":
      return contentRange;
  }
}
