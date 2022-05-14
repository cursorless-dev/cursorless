import { ProcessedTargetsContext, TypedSelection } from "../typings/Types";

export interface MarkStage {
  run(context: ProcessedTargetsContext): TypedSelection[];
}

export interface ModifierStage {
  run(
    context: ProcessedTargetsContext,
    target?: TypedSelection
  ): TypedSelection | TypedSelection[];
}
