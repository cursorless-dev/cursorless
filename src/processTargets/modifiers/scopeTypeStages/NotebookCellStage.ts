import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import NotebookCellTarget from "../../targets/NotebookCellTarget";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): NotebookCellTarget[] {
    if (this.modifier.type === "everyScope") {
      throw new Error(`Every ${this.modifier.type} not yet implemented`);
    }

    return [
      new NotebookCellTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: target.contentRange,
      }),
    ];
  }
}
