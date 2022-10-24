import { Target } from "../../typings/target.types";
import { ScopeType } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";

export class OutOfRangeError extends Error {
  constructor() {
    super("Scope index out of range");
    this.name = "OutOfRangeError";
  }
}

/**
 * Construct a single range target between two targets in a list of targets,
 * inclusive
 * @param targets The list of targets to index into
 * @param startIndex The index of the target in {@link targets} that will form
 * the start of the range
 * @param endIndex The index of the target in {@link targets} that will form the
 * end of the range
 */
export function createRangeTargetFromIndices(
  isReversed: boolean,
  targets: Target[],
  startIndex: number,
  endIndex: number
): Target {
  if (startIndex < 0 || endIndex >= targets.length) {
    throw new OutOfRangeError();
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
