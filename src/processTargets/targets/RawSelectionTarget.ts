import { Range, TextEditor } from "vscode";
import { EditNewLineContext } from "../../typings/target.types";
import BaseTarget from "./BaseTarget";

interface RawSelectionTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
}

export default class RawSelectionTarget extends BaseTarget {
  constructor(parameters: RawSelectionTargetParameters) {
    super({ ...parameters, delimiter: "" });
  }

  get delimiter() {
    return undefined;
  }

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: "",
    };
  }
}
