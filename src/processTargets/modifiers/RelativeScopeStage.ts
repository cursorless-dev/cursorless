import { findLastIndex } from "lodash";
import { Range } from "vscode";
import { NoContainingScopeError } from "../../errors";
import { Target } from "../../typings/target.types";
import { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
} from "./targetSequenceUtils";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    /**
     * This boolean indicates that {@link RelativeScopeModifier.offset} is 0,
     * meaning that we need to include the scope containing the input {@link target}
     */
    const includeContaining = this.modifier.offset === 0;
    const isForward = this.modifier.direction === "forward";
    /**
     * A list of targets in the iteration scope for the input {@link target}.
     * Note that we convert {@link target} to have no explicit range so that we
     * get all targets in the iteration scope rather than just the intersecting
     * targets.
     *
     * FIXME: In the future we should probably use a better abstraction for this, but
     * that will rely on #629
     */
    const targets = getEveryScopeTargets(
      context,
      createTargetWithoutExplicitRange(target),
      this.modifier.scopeType
    );

    const intersectingIndices = (() => {
      const intersectingIndices = getIntersectingTargetIndices(
        target.contentRange,
        targets
      );

      // The content range isnt containing any scopes, but they should not be
      // included anyhow. Find a non containing relative index.
      if (intersectingIndices.length === 0 && !includeContaining) {
        const adjacentTargetIndex = getAdjacentTargetIndex(
          target.contentRange,
          targets,
          isForward
        );
        return adjacentTargetIndex === -1 ? [] : [adjacentTargetIndex];
      }

      return intersectingIndices;
    })();

    if (intersectingIndices.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    const intersectingStartIndex = intersectingIndices[0];
    const intersectingEndIndex = intersectingIndices.at(-1)!;

    /** Reference index. This is the index closest to the target content range. */
    let refIndex: number;

    // Include containing scopes
    if (includeContaining) {
      // Number of scopes intersecting with input target is already greater than
      // desired length; throw error.  This occurs if user says "two funks", and
      // they have 3 functions selected.  Not clear what to do in that case so
      // we throw error.
      if (intersectingIndices.length > this.modifier.length) {
        throw new Error(
          `Incorrect ordinal length ${this.modifier.length}. Containing length is already ${intersectingIndices.length}`
        );
      }
      refIndex = isForward ? intersectingStartIndex : intersectingEndIndex;
    }
    // Exclude containing scopes
    else {
      refIndex = isForward
        ? intersectingEndIndex + this.modifier.offset
        : intersectingStartIndex - this.modifier.offset;
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

/** Get indices of all targets in {@link targets} intersecting with
 * {@link inputTargetRange} */
function getIntersectingTargetIndices(
  inputTargetRange: Range,
  targets: Target[]
): number[] {
  const targetsWithIntersection = targets
    .map((t, i) => ({
      index: i,
      intersection: t.contentRange.intersection(inputTargetRange),
    }))
    .filter((t) => t.intersection != null);

  // Input target range is empty. Use rightmost target and accept weak
  // containment.
  if (inputTargetRange.isEmpty) {
    return targetsWithIntersection.slice(-1).map((t) => t.index);
  }

  // Input target range is not empty. Use all targets with non empty
  // intersections.
  return targetsWithIntersection
    .filter((t) => !t.intersection!.isEmpty)
    .map((t) => t.index);
}

/** Get index of closest target to {@link inputTargetRange} in direction
 * determined by {@link isForward}, or -1 if no target exists in the given direction. */
function getAdjacentTargetIndex(
  inputTargetRange: Range,
  targets: Target[],
  isForward: boolean
): number {
  const index = isForward
    ? targets.findIndex((t) =>
        t.contentRange.start.isAfter(inputTargetRange.start)
      )
    : findLastIndex(targets, (t) =>
        t.contentRange.start.isBefore(inputTargetRange.start)
      );

  if (index > -1) {
    return isForward ? index - 1 : index + 1;
  }

  return index;
}

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
