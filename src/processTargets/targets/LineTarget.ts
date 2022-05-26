import { Range } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import { processRemovalRange } from "../../util/targetUtils";
import BaseTarget, {
  CloneWithParameters,
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

interface LineTargetParameters extends CommonTargetParameters {
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
}

export default class LineTarget extends BaseTarget {
  constructor(parameters: LineTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      leadingDelimiter: parameters.leadingDelimiter,
      trailingDelimiter: parameters.trailingDelimiter,
      delimiter: "\n",
    });
  }

  get isLine() {
    return true;
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position != null) {
      return undefined;
    }
    return this.contentRange;
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
      processRemovalRange(this.trailingDelimiter) ??
      processRemovalRange(this.leadingDelimiter);
    return delimiter != null
      ? removalRange.union(delimiter.range)
      : removalRange;
  }

  cloneWith(parameters: CloneWithParameters): LineTarget {
    return new LineTarget({ ...this.state, ...parameters });
  }
}
