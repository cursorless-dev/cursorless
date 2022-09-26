import { Target } from "../../typings/target.types";
import {
  AbsoluteOrdinalScopeModifier,
  RelativeOrdinalScopeModifier,
  ScopeType,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";

export class AbsoluteOrdinalStage implements ModifierStage {
  constructor(private modifier: AbsoluteOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    let targets = getTargets(context, target, this.modifier.scopeType);

    if (target.hasExplicitRange) {
      targets = targets.filter((t) => {
        const intersection = t.contentRange.intersection(target.contentRange);
        return intersection != null && !intersection.isEmpty;
      });
    }

    const startIndex =
      this.modifier.start + (this.modifier.start < 0 ? targets.length : 0);
    const endIndex = startIndex + this.modifier.length - 1;

    return [createTarget(target, targets, startIndex, endIndex)];
  }
}

export class RelativeOrdinalStage implements ModifierStage {
  constructor(private modifier: RelativeOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getTargets(context, target, this.modifier.scopeType);

    const containingIndices = targets
      .map((t, i) => ({
        index: i,
        intersection: t.contentRange.intersection(target.contentRange),
      }))
      .filter((t) => t.intersection != null)
      .map((t) => t.index);
    const containingStartIndex = containingIndices[0];
    const containingEndIndex = containingIndices[containingIndices.length - 1];

    let index: number;

    // Include containing/intersecting scopes
    if (this.modifier.offset === 0) {
      // Number of current containing scopes is already greater than desired length.
      if (containingIndices.length > this.modifier.length) {
        throw new Error(
          `Incorrect ordinal length ${this.modifier.length}. Containing length is already ${containingIndices.length}`
        );
      }
      index =
        this.modifier.direction === "forward"
          ? containingStartIndex
          : containingEndIndex;
    }
    // Exclude containing/intersecting scopes
    else {
      index =
        this.modifier.direction === "forward"
          ? containingEndIndex + this.modifier.offset
          : containingStartIndex - this.modifier.offset;
    }

    const index2 =
      this.modifier.direction === "forward"
        ? index + this.modifier.length - 1
        : index - this.modifier.length + 1;

    const startIndex = Math.min(index, index2);
    const endIndex = Math.max(index, index2);

    return [createTarget(target, targets, startIndex, endIndex)];
  }
}

function createTarget(
  target: Target,
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
    target.isReversed,
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
