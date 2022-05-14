import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import { MarkStage } from "../PipelineStages.types";

export default class implements MarkStage {
  run(context: ProcessedTargetsContext): TypedSelection[] {
    return context.sourceMark.map((selection) => ({
      editor: selection.editor,
      isReversed: isReversed(selection.selection),
      contentRange: selection.selection,
    }));
  }
}
