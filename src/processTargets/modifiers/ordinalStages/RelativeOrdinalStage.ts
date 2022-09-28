import { Target } from "../../../typings/target.types";
import { RelativeOrdinalScopeModifier } from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { UntypedTarget } from "../../targets";
import { createTarget, getTargets } from "./OrdinalStagesUtil";

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

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
