import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import { RelativeOrdinalScopeModifier } from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { UntypedTarget } from "../../targets";
import { createTarget, getEveryScopeTargets } from "./OrdinalStagesUtil";

export class RelativeOrdinalStage implements ModifierStage {
  constructor(private modifier: RelativeOrdinalScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const targets = getEveryScopeTargets(
      context,
      createTargetWithoutExplicitRange(target),
      this.modifier.scopeType
    );
    const containingIndices = getContainingIndices(
      target.contentRange,
      targets
    );
    const containingStartIndex = containingIndices[0];
    const containingEndIndex = containingIndices.at(-1)!;
    const isForward = this.modifier.direction === "forward";

    // Reference index. This is the index closest to the target content range.
    let refIndex: number;

    // Include containing scopes
    if (this.modifier.offset === 0) {
      // Number of current containing scopes is already greater than desired length.
      if (containingIndices.length > this.modifier.length) {
        throw new Error(
          `Incorrect ordinal length ${this.modifier.length}. Containing length is already ${containingIndices.length}`
        );
      }
      refIndex = isForward ? containingStartIndex : containingEndIndex;
    }
    // Exclude containing scopes
    else {
      refIndex = isForward
        ? containingEndIndex + this.modifier.offset
        : containingStartIndex - this.modifier.offset;
    }

    // Index opposite reference index
    const oppIndex = isForward
      ? refIndex + this.modifier.length - 1
      : refIndex - this.modifier.length + 1;

    const startIndex = Math.min(refIndex, oppIndex);
    const endIndex = Math.max(refIndex, oppIndex);

    return [createTarget(target.isReversed, targets, startIndex, endIndex)];
  }
}

/** Get indices to all targets containing content range */
function getContainingIndices(
  contentRange: Range,
  targets: Target[]
): number[] {
  const targetsWithIntersection = targets.map((t, i) => ({
    index: i,
    intersection: t.contentRange.intersection(contentRange),
  }));

  // Content range is empty. Use rightmost target.
  if (contentRange.isEmpty) {
    return targetsWithIntersection
      .filter((t) => t.intersection != null)
      .slice(-1)
      .map((t) => t.index);
  }

  // Content range is not empty. Use all fully contained targets.
  return targetsWithIntersection
    .filter((t) => t.intersection != null && !t.intersection.isEmpty)
    .map((t) => t.index);
}

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
