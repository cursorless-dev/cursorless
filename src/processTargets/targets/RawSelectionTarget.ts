import { Range, TextEditor } from "vscode";
import BaseTarget from "./BaseTarget";

interface RawSelectionTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
}

export default class RawSelectionTarget extends BaseTarget {
  constructor(parameters: RawSelectionTargetParameters) {
    super(parameters);
    this.delimiter = undefined;
  }
}
