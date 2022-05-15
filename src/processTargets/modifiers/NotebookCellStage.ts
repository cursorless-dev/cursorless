import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target {
    return {
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange: target.contentRange,
      isNotebookCell: true,
    };
  }
}
