import { window } from "vscode";
import { TypedSelection } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenContext } from "../modifiers/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  run(): TypedSelection[] {
    if (window.activeTextEditor == null) {
      return [];
    }
    return window.activeTextEditor.selections.map((selection) => ({
      editor: window.activeTextEditor!,
      isReversed: isReversed(selection),
      contentRange: selection,
      ...getTokenContext(window.activeTextEditor!, selection),
    }));
  }
}
