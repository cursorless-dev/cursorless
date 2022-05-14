import { ThatMark } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { getTokenContext } from "../modifiers/TokenStage";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  constructor(private modifier: ThatMark) {}

  run(context: ProcessedTargetsContext): TypedSelection[] {
    return context.thatMark.map((selection) => ({
      editor: selection.editor,
      isReversed: isReversed(selection.selection),
      contentRange: selection.selection,
      ...getTokenContext(selection.editor, selection.selection),
    }));
  }
}
