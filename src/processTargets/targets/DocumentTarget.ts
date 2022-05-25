import { Range } from "vscode";
import { Position } from "../../typings/target.types";
import BaseTarget, {
  CommonTargetParameters,
  extractCommonParameters,
} from "./BaseTarget";

export default class DocumentTarget extends BaseTarget {
  constructor(parameters: CommonTargetParameters) {
    super({
      ...extractCommonParameters(parameters),
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
    return new Range(
      this.editor.document.lineAt(0).range.start,
      this.editor.document.lineAt(this.editor.document.lineCount - 1).range.end
    );
  }

  withPosition(position: Position): DocumentTarget {
    return new DocumentTarget({ ...this.state, position });
  }
}
