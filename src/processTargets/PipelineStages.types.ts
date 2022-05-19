import { Target } from "../typings/target.types";
import { ProcessedTargetsContext } from "../typings/Types";

export interface MarkStage {
  run(context: ProcessedTargetsContext): Target[];
}

export interface ModifierStage {
  run(context: ProcessedTargetsContext, target: Target): Target[];
}
