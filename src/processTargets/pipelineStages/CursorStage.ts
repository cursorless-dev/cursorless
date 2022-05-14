import { window } from "vscode";
import { TypedSelection } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(): TypedSelection[] {
    if (window.activeTextEditor == null) {
      return [];
    }
    return window.activeTextEditor.selections.map((selection) => ({
      editor: window.activeTextEditor!,
      isReversed: isReversed(selection),
      contentRange: selection,
    }));
  }
}
