import type { Target } from "../typings/target.types";
import type { ProcessedTargetsContext } from "../typings/Types";

export interface MarkStage {
  run(context: ProcessedTargetsContext): Target[];
}

export interface ModifierStage {
  run(context: ProcessedTargetsContext, target: Target): Target[];
}
