import { Target } from "../../typings/target.types";
import {
  AbsoluteOrdinalScopeModifier,
  RelativeOrdinalScopeModifier,
  ScopeType,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export class AbsoluteOrdinalStage implements ModifierStage {
  constructor(private modifier: AbsoluteOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getTargets(context, target, this.modifier.scopeType);

    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    return [createTarget(target.isReversed, targets, startIndex, endIndex)];
  }
}

export class RelativeOrdinalStage implements ModifierStage {
  constructor(private modifier: RelativeOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getTargets(
      context,
      createTargetWithoutExplicitRange(target),
      this.modifier.scopeType
    );
    const isForward = this.modifier.direction === "forward";

    const containingIndices = targets
      .map((t, i) => ({
        index: i,
        intersection: t.contentRange.intersection(target.contentRange),
      }))
      .filter((t) => t.intersection != null)
      .map((t) => t.index);
    const containingStartIndex = containingIndices[0];
    const containingEndIndex = containingIndices[containingIndices.length - 1];

    // Reference index. This is the index close as to the target content range
    let index: number;

    // Include containing/intersecting scopes
    if (this.modifier.offset === 0) {
      // Number of current containing scopes is already greater than desired length.
      if (containingIndices.length > this.modifier.length) {
        throw new Error(
          `Incorrect ordinal length ${this.modifier.length}. Containing length is already ${containingIndices.length}`
        );
      }
      index = isForward ? containingStartIndex : containingEndIndex;
    }
    // Exclude containing/intersecting scopes
    else {
      index = isForward
        ? containingEndIndex + this.modifier.offset
        : containingStartIndex - this.modifier.offset;
    }

    // Index opposite reference index
    const index2 = isForward
      ? index + this.modifier.length - 1
      : index - this.modifier.length + 1;

    const startIndex = Math.min(index, index2);
    const endIndex = Math.max(index, index2);

    return [createTarget(target.isReversed, targets, startIndex, endIndex)];
  }
}

/**
 * Construct a single target from the list of targets
 * @param startIndex inclusive
 * @param endIndex inclusive
 */
function createTarget(
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

function getTargets(
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

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
