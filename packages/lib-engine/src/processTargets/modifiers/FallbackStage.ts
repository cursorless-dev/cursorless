import type { FallbackModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";

/**
 * Tries each of the given modifiers in turn until one of them doesn't throw an
 * error, returning the output from the first modifier not throwing an error.
 */
export class FallbackStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: FallbackModifier,
  ) {}

  run(target: Target, options: ModifierStateOptions): Target[] {
    const stages = this.modifier.modifiers.map(
      this.modifierStageFactory.create,
    );

    for (const stage of stages) {
      try {
        return stage.run(target, options);
      } catch (_error) {
        continue;
      }
    }

    throw new Error("No modifier could be applied");
  }
}
