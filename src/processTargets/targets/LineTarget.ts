import { Position, Range } from "vscode";
import {
  getLineLeadingDelimiterRange,
  getLineTrailingDelimiterRange,
} from "../targetUtil/getLineDelimiters";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class LineTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      delimiter: "\n",
    });
  }

  get isLine() {
    return true;
  }

  cloneWith(parameters: CloneWithParameters): LineTarget {
    return new LineTarget({ ...this.state, ...parameters });
  }

  get contentRemovalRange() {
    return new Range(
      new Position(this.contentRange.start.line, 0),
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
  }

  get leadingDelimiterRange() {
    return getLineLeadingDelimiterRange(this.editor, this.contentRemovalRange);
  }

  get trailingDelimiterRange() {
    return getLineTrailingDelimiterRange(this.editor, this.contentRemovalRange);
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position != null) {
      return undefined;
    }
    return this.contentRange;
  }
}
