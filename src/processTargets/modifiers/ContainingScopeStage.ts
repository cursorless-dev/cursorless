import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { ContainingScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import getLegacyScopeStage from "./getLegacyScopeStage";
import {
  getLeftScope,
  getPreferredScope,
  getRightScope,
} from "./getPreferredScope";

/**
 * This modifier stage expands from the input target to the smallest containing
 * scope.  We proceed as follows:
 *
 * 1. Expand to smallest scope(s) touching start position of input target's
 *    content range
 * 2. If input target has an empty content range, return the start scope,
 *    breaking ties as defined by {@link getPreferredScope} when more than one
 *    scope touches content range
 * 3. Otherwise, if end of input target is weakly contained by the domain of the
 *    rightmost start scope, return rightmost start scope.  We return rightmost
 *    because that will have non-empty intersection with input target content
 *    range.
 * 4. Otherwise, expand from end of input target and form a range from rightmost
 *    start scope through leftmost end scope.  We use rightmost start scope and
 *    leftmost end scope because those will have non-empty intersection with
 *    input target content range.
 */
export class ContainingScopeStage implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const {
      isReversed,
      editor,
      contentRange: { start, end },
    } = target;
    const { scopeType, ancestorIndex } = this.modifier;

    const scopeHandler = getScopeHandler(
      scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    const startScopes = scopeHandler.getScopesTouchingPosition(
      editor,
      start,
      ancestorIndex,
    );

    if (startScopes.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    if (end.isEqual(start)) {
      // Input target is empty; return the preferred scope touching target
      return [getPreferredScope(startScopes)!.getTarget(isReversed)];
    }

    // Target is non-empty; use the rightmost scope touching `startScope`
    // because that will have non-empty overlap with input content range
    const startScope = getRightScope(startScopes)!;

    if (startScope.domain.contains(end)) {
      // End of input target is contained in domain of start scope; return start
      // scope
      return [startScope.getTarget(isReversed)];
    }

    // End of input target is after end of start scope; we need to make a range
    // between start and end scopes.  For the end scope, we break ties to the
    // left so that the scope will have non-empty overlap with input target
    // content range.
    const endScopes = scopeHandler.getScopesTouchingPosition(
      editor,
      end,
      ancestorIndex,
    );
    const endScope = getLeftScope(endScopes);

    if (endScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return [constructScopeRangeTarget(isReversed, startScope, endScope)];
  }
}
