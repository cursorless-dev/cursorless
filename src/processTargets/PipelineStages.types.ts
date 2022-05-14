import { Mark, Modifier } from "../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../typings/Types";

export interface MarkStage {
  run(context: ProcessedTargetsContext, mark: Mark): TypedSelection[];
}

export interface ModifierStage {
  run(
    context: ProcessedTargetsContext,
    modifier: Modifier,
    target?: TypedSelection
  ): TypedSelection | TypedSelection[];
}
