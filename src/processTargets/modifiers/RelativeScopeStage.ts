import { findLastIndex } from "lodash";
import { Range } from "vscode";
import { Target } from "../../typings/target.types";
import { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
  OutOfRangeError,
} from "./targetSequenceUtils";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
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

    /** Proximal index. This is the index closest to the target content range. */
    const proximalIndex = this.computeProximalIndex(
      target.contentRange,
      targets,
      isForward
    );

    /** Index of range farther from input target */
    const distalIndex = isForward
      ? proximalIndex + this.modifier.length - 1
      : proximalIndex - this.modifier.length + 1;

    const startIndex = Math.min(proximalIndex, distalIndex);
    const endIndex = Math.max(proximalIndex, distalIndex);

    return [
      createRangeTargetFromIndices(
        target.isReversed,
        targets,
        startIndex,
        endIndex
      ),
    ];
  }

  /**
   * Compute the index of the target that will form the near end of the range.
   *
   * @param inputTargetRange The range of the input target to the modifier stage
   * @param targets A list of all targets under consideration (eg in iteration
   * scope)
   * @param isForward `true` if we are handling "next", `false` if "previous"
   * @returns The index into {@link targets} that will form the near end of the range.
   */
  private computeProximalIndex(
    inputTargetRange: Range,
    targets: Target[],
    isForward: boolean
  ) {
    const includeIntersectingScopes = this.modifier.offset === 0;

    const intersectingIndices = getIntersectingTargetIndices(
      inputTargetRange,
      targets
    );

    if (intersectingIndices.length === 0) {
      const adjacentTargetIndex = isForward
        ? targets.findIndex((t) =>
            t.contentRange.start.isAfter(inputTargetRange.start)
          )
        : findLastIndex(targets, (t) =>
            t.contentRange.start.isBefore(inputTargetRange.start)
          );

      if (adjacentTargetIndex === -1) {
        throw new OutOfRangeError();
      }

      // For convenience, if they ask to include intersecting indices, we just
      // start with the nearest one in the correct direction.  So eg if you say
      // "two funks" between functions, it will take two functions to the right
      // of you.
      if (includeIntersectingScopes) {
        return adjacentTargetIndex;
      }

      return isForward
        ? adjacentTargetIndex + this.modifier.offset - 1
        : adjacentTargetIndex - this.modifier.offset + 1;
    }

    // If we've made it here, then there are scopes intersecting with
    // {@link inputTargetRange}

    const intersectingStartIndex = intersectingIndices[0];
    const intersectingEndIndex = intersectingIndices.at(-1)!;

    if (includeIntersectingScopes) {
      // Number of scopes intersecting with input target is already greater than
      // desired length; throw error.  This occurs if user says "two funks", and
      // they have 3 functions selected.  Not clear what to do in that case so
      // we throw error.
      if (intersectingIndices.length > this.modifier.length) {
        throw new TooFewScopesError(
          this.modifier.length,
          intersectingIndices.length,
          this.modifier.scopeType.type
        );
      }

      // This ensures that we count intersecting scopes in "three funks", so
      // that we will never get more than 3 functions.
      return isForward ? intersectingStartIndex : intersectingEndIndex;
    }

    // If we are excluding the intersecting scopes, then we set 0 to be such
    // that the next scope will be the first non-intersecting.
    return isForward
      ? intersectingEndIndex + this.modifier.offset
      : intersectingStartIndex - this.modifier.offset;
  }
}

class TooFewScopesError extends Error {
  constructor(
    requestedLength: number,
    currentLength: number,
    scopeType: string
  ) {
    super(
      `Requested ${requestedLength} ${scopeType}s, but ${currentLength} are already selected.`
    );
    this.name = "TooFewScopesError";
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

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
