import { Range } from "vscode";
import { RemovalRange } from "../../typings/target.types";
import { parseRemovalRange } from "../../util/targetUtils";
import BaseTarget, {
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
      delimiter: "\n",
    });
  }

  get isLine() {
    return true;
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

  clone(): LineTarget {
    return new LineTarget(this.state);
  }
}
