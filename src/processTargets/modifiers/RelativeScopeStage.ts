import type { Target } from "../../typings/target.types";
import type { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import RelativeExclusiveScopeStage from "./RelativeExclusiveScopeStage";
import { RelativeInclusiveScopeStage } from "./RelativeInclusiveScopeStage";

export default class RelativeScopeStage implements ModifierStage {
  private modiferStage: ModifierStage;
  constructor(private modifier: RelativeScopeModifier) {
    this.modiferStage =
      this.modifier.offset === 0
        ? new RelativeInclusiveScopeStage(modifier)
        : new RelativeExclusiveScopeStage(modifier);
  }

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return this.modiferStage.run(context, target);
  }
}
