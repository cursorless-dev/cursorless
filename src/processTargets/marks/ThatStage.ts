import { Target, ThatMark } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenContext } from "../modifiers/scopeTypeStages/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: ThatMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    return context.thatMark.map((selection) => {
      const target = {
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      };
      return {
        ...target,
        ...getTokenContext(target),
      };
    });
  }
}
