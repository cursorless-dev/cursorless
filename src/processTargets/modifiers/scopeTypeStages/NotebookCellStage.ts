import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Target,
} from "../../../typings/target.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    if (this.modifier.type === "everyScope") {
      throw new Error(`Every ${this.modifier.type} not yet implemented`);
    }

    return [
      new ScopeTypeTarget({
        delimiter: "\n",
        ...target,
        scopeType: this.modifier.scopeType,
      }),
    ];
  }
}
