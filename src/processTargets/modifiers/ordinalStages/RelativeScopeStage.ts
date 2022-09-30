import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import { RelativeScopeModifier } from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { UntypedTarget } from "../../targets";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./OrdinalStagesUtil";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

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

    /** Reference index. This is the index closest to the target content range. */
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

    /** Index opposite reference index */
    const oppIndex = isForward
      ? refIndex + this.modifier.length - 1
      : refIndex - this.modifier.length + 1;

    const startIndex = Math.min(refIndex, oppIndex);
    const endIndex = Math.max(refIndex, oppIndex);

    return [
      createRangeTargetFromIndices(
        target.isReversed,
        targets,
        startIndex,
        endIndex
      ),
    ];
  }
}

/** Get indices of all targets containing content range */
function getContainingIndices(
  inputTargetRange: Range,
  targets: Target[]
): number[] {
  const targetsWithIntersection = targets
    .map((t, i) => ({
      index: i,
      intersection: t.contentRange.intersection(inputTargetRange),
    }))
    .filter((t) => t.intersection != null);

  // Content range is empty. Use rightmost target and accept weak containment.
  if (inputTargetRange.isEmpty) {
    // FIXME: Handle case where no targets intersect with the input range
    return targetsWithIntersection.slice(-1).map((t) => t.index);
  }

  // Content range is not empty. Use all targets with non empty intersections.
  return targetsWithIntersection
    .filter((t) => !t.intersection!.isEmpty)
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
