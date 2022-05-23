import { Range } from "vscode";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class DocumentTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
      scopeTypeType: "document",
      delimiter: "\n",
    });
  }

  protected getRemovalContentRange(): Range {
    if (this.position != null) {
      return this.contentRange;
    }
    return new Range(
      this.editor.document.lineAt(0).range.start,
      this.editor.document.lineAt(this.editor.document.lineCount - 1).range.end
    );
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

  clone(): DocumentTarget {
    return new DocumentTarget(this.state);
  }
}
