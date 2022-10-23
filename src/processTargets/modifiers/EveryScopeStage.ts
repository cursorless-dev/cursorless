import { Range } from "vscode";
import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type {
  EveryScopeModifier,
  ScopeType,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import type { ModifierStage } from "../PipelineStages.types";
import getLegacyScopeStage from "./getLegacyScopeStage";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { scopeTypeToString } from "./scopeHandlers/scopeTypeUtil";

/**
 * This modifier returns all scopes intersecting the input target if the target
 * has an explicit range (ie {@link Target.hasExplicitRange} is `true`).  If the
 * target does not have an explicit range, this modifier returns all scopes in
 * the canonical iteration scope defined by the scope handler in
 * {@link ScopeHandler.getIterationScopesTouchingPosition}.
 *
 * We proceed as follows:
 *
 * 1. If target has an explicit range, just return all targets returned from
 *    {@link ScopeHandler.getScopesOverlappingRange}.
 * 2. Otherwise, get the iteration scope for the start of the input target.
 * 3. If two iteration scopes touch the start position, choose the preferred one
 *    if input target has empty content range, otherwise prefer the rightmost
 *    one, as that will have an overlap with the target input content range.
 * 3. If the domain of the iteration scope doesn't contain the end of the input
 *    target, we error, because this situation shouldn't really happen, as
 *    targets without explicit range tend to be small.
 * 4. Return all targets in the iteration scope
 */
export class EveryScopeStage implements ModifierStage {
  constructor(private modifier: EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { scopeType } = this.modifier;
    const { editor, isReversed } = target;

    const scopeHandler = getScopeHandler(scopeType, editor.document.languageId);

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    const range = target.hasExplicitRange
      ? target.contentRange
      : this.getDefaultIterationRange(context, scopeHandler, target);

    const scopes = scopeHandler.getScopesOverlappingRange(editor, range);

    if (scopes.length === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return scopes.map((scope) => scope.getTarget(isReversed));
  }

  getDefaultIterationRange(
    context: ProcessedTargetsContext,
    scopeHandler: ScopeHandler,
    target: Target
  ): Range {
    const { iterationScopeType } = scopeHandler;

    if (iterationScopeType == null) {
      throw new NoDefaultIterationScopeError(this.modifier.scopeType);
    }

    const containingIterationsScopeModifier = getModifierStage({
      type: "containingScope",
      scopeType: iterationScopeType,
    });

    return containingIterationsScopeModifier.run(context, target)[0]
      .contentRange;
  }
}

/**
 * Throw this error when the user calls `"every"` on a scope with no explicit
 * range and a scope type that has no iteration scope
 */
export default class NoDefaultIterationScopeError extends Error {
  /**
   *
   * @param scopeType The scopeType for the failed match to show to the user
   */
  constructor(scopeType: ScopeType) {
    super(
      `The ${scopeTypeToString(
        scopeType
      )} scope type has no default iteration scope.`
    );
    this.name = "NoDefaultIterationScopeError";
  }
}
