import { Range, TextEditor } from "vscode";
import { EditNewLineContext } from "../../typings/target.types";
import { getTokenDelimiters } from "../modifiers/scopeTypeStages/TokenStage";
import BaseTarget from "./BaseTarget";

interface TokenTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
}

export default class TokenTarget extends BaseTarget {
  constructor(parameters: TokenTargetParameters) {
    super({
      ...parameters,
      ...getTokenDelimiters(parameters.editor, parameters.contentRange),
      scopeType: "token",
    });
  }

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: " ",
    };
  }
}
