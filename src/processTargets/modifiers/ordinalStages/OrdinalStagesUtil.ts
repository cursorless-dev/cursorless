import { Target } from "../../../typings/target.types";
import { ScopeType } from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import getModifierStage from "../../getModifierStage";

/**
 * Construct a single target from the list of targets
 * @param startIndex inclusive
 * @param endIndex inclusive
 */
export function createTarget(
  isReversed: boolean,
  targets: Target[],
  startIndex: number,
  endIndex: number
): Target {
  if (startIndex < 0 || endIndex >= targets.length) {
    throw new Error("Ordinal index out of range");
  }

  if (startIndex === endIndex) {
    return targets[startIndex];
  }

  return targets[startIndex].createContinuousRangeTarget(
    isReversed,
    targets[endIndex],
    true,
    true
  );
}

export function getEveryScopeTargets(
  context: ProcessedTargetsContext,
  target: Target,
  scopeType: ScopeType
): Target[] {
  const containingStage = getModifierStage({
    type: "everyScope",
    scopeType,
  });
  return containingStage.run(context, target);
}
