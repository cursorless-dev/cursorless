import { NoContainingScopeError } from "../../errors";
import { Target } from "../../typings/target.types";
import {
  NextContainingScopeModifier,
  PreviousContainingScopeModifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

export default class PreviousNextContainingScopeStage implements ModifierStage {
  constructor(
    private modifier:
      | PreviousContainingScopeModifier
      | NextContainingScopeModifier
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const containingStage = getModifierStage({
      type: "everyScope",
      scopeType: this.modifier.scopeType,
    });
    const targets = containingStage.run(context, target);

    const resultTarget =
      this.modifier.type === "previousContainingScope"
        ? this.getPreviousTarget(target, targets)
        : this.getNextTarget(target, targets);

    if (resultTarget == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return [resultTarget];
  }

  private getPreviousTarget(target: Target, targets: Target[]) {
    const currentTargetIndex = targets.findIndex((t) =>
      t.contentRange.contains(target.contentRange.start)
    );
    if (currentTargetIndex > 0) {
      return targets[currentTargetIndex - 1];
    }
    return null;
  }

  private getNextTarget(target: Target, targets: Target[]) {
    const currentTargetIndex = targets.findIndex((t) =>
      t.contentRange.contains(target.contentRange.end)
    );
    if (currentTargetIndex > -1 && currentTargetIndex + 1 < targets.length) {
      return targets[currentTargetIndex + 1];
    }
    return null;
  }
}
