import { Range } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import { processRemovalRange } from "../../util/targetUtils";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

interface ParagraphTargetParameters extends CommonTargetParameters {
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class ParagraphTarget extends BaseTarget {
  constructor(parameters: ParagraphTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      leadingDelimiter: parameters.leadingDelimiter,
      trailingDelimiter: parameters.trailingDelimiter,
      delimiter: "\n\n",
    });
  }

  get isLine() {
    return true;
  }

  get isParagraph() {
    return true;
  }

  cloneWith(parameters: CloneWithParameters): ParagraphTarget {
    return new ParagraphTarget({ ...this.state, ...parameters });
  }

  getRemovalContentRange(): Range {
    const removalRange = new Range(
      this.editor.document.lineAt(this.contentRange.start).range.start,
      this.editor.document.lineAt(this.contentRange.end).range.end
    );
    const delimiterRange = (() => {
      const leadingDelimiter = processRemovalRange(this.leadingDelimiter);
      const trailingDelimiter = processRemovalRange(this.trailingDelimiter);
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
}
