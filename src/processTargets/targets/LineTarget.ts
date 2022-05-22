import { Range, TextEditor } from "vscode";
import { RemovalRange, ScopeType } from "../../typings/target.types";
import { parseRemovalRange } from "../../util/targetUtils";
import BaseTarget from "./BaseTarget";

interface LineTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class LineTarget extends BaseTarget {
  scopeType: ScopeType;
  delimiter: string;

  constructor(parameters: LineTargetParameters) {
    super(parameters);
    this.scopeType = "line";
    this.delimiter = "\n";
    this.isLine = true;
  }

  protected getRemovalContentRange(): Range {
    if (this.position != null) {
      return this.contentRange;
    }
    const removalRange = new Range(
      this.editor.document.lineAt(this.contentRange.start).range.start,
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
    const delimiter =
      parseRemovalRange(this.trailingDelimiter) ??
      parseRemovalRange(this.leadingDelimiter);
    return delimiter != null
      ? removalRange.union(delimiter.range)
      : removalRange;
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position != null) {
      return undefined;
    }
    return this.contentRange;
  }
}
