import { Range, TextEditor } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import { parseRemovalRange } from "../../util/targetUtils";
import BaseTarget from "./BaseTarget";

interface ParagraphTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class ParagraphTarget extends BaseTarget {
  constructor(parameters: ParagraphTargetParameters) {
    super(parameters);
    this.scopeType = "paragraph";
    this.delimiter = "\n\n";
    this.isLine = true;
  }

  protected getRemovalBeforeRange(): Range {
    return this.leadingDelimiter != null
      ? new Range(
          this.leadingDelimiter.range.start,
          this.editor.document.lineAt(
            this.contentRange.start.line - 1
          ).range.start
        )
      : this.contentRange;
  }

  protected getRemovalAfterRange(): Range {
    return this.trailingDelimiter != null
      ? this.trailingDelimiter.range
      : this.contentRange;
  }

  getRemovalContentRange(): Range {
    const removalRange = new Range(
      this.editor.document.lineAt(this.contentRange.start).range.start,
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
    const delimiterRange = (() => {
      const leadingDelimiter = parseRemovalRange(this.leadingDelimiter);
      const trailingDelimiter = parseRemovalRange(this.trailingDelimiter);
      if (trailingDelimiter != null) {
        const { document } = this.editor;
        // Trailing delimiter to end of file. Need to remove leading new line delimiter
        if (
          trailingDelimiter.range.end.line === document.lineCount - 1 &&
          leadingDelimiter != null
        ) {
          return new Range(
            document.lineAt(this.contentRange.start.line - 1).range.end,
            trailingDelimiter.range.end
          );
        }
        return trailingDelimiter.range;
      }
      if (leadingDelimiter) {
        return leadingDelimiter.range;
      }
      return undefined;
    })();
    return delimiterRange != null
      ? removalRange.union(delimiterRange)
      : removalRange;
  }
}
