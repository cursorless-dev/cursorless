import type { Target } from "../../typings/target.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { MarkStage } from "../PipelineStages.types";
import { ImplicitTarget } from "../targets";

export default class ImplicitStage implements MarkStage {
  run(context: ProcessedTargetsContext): Target[] {
    return context.currentSelections.map(
      (selection) =>
        new ImplicitTarget({
          editor: selection.editor,
          isReversed: selection.selection.isReversed,
          contentRange: selection.selection,
        }),
    );
  }
}
