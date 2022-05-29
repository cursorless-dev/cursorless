import { RawSelectionModifier, Target } from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import RawSelectionTarget from "../targets/RawSelectionTarget";

export default class RawSelectionStage implements ModifierStage {
  constructor(private modifier: RawSelectionModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    return [toRawTarget(target)];
  }
}

export function toRawTarget(target: Target) {
  return new RawSelectionTarget({
    editor: target.editor,
    contentRange: target.contentRange,
    isReversed: target.isReversed,
  });
}
