import { CascadingModifier } from "@cursorless/common";
import { ProcessedTargetsContext } from "../../typings/Types";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";

/**
 * Tries each of the given modifiers in turn until one of them doesn't throw an
 * error, returning the output from the first modifier not throwing an error.
 */
export default class CascadingStage implements ModifierStage {
  private nestedStages_?: ModifierStage[];

  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: CascadingModifier,
  ) {}

  private get nestedStages() {
    if (this.nestedStages_ == null) {
      this.nestedStages_ = this.modifier.modifiers.map(
        this.modifierStageFactory.create,
      );
    }

    return this.nestedStages_;
  }

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    for (const nestedStage of this.nestedStages) {
      try {
        return nestedStage.run(context, target);
      } catch (error) {
        continue;
      }
    }

    throw new Error("No modifier could be applied");
  }
}
