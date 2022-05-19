import { window } from "vscode";
import { CursorMark, Target } from "../../typings/target.types";
import BaseTarget from "../targets/BaseTarget";
import { isReversed } from "../../util/selectionUtils";
import { getTokenContext } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: CursorMark) {}

  run(): Target[] {
    if (window.activeTextEditor == null) {
      return [];
    }
    return window.activeTextEditor.selections.map((selection) => {
      const editor = window.activeTextEditor!;
      return new BaseTarget({
        ...getTokenContext(editor, selection),
        editor,
        isReversed: isReversed(selection),
        contentRange: selection,
      });
    });
  }
}
