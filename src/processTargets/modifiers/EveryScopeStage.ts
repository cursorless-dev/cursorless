import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { EveryScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import type { ModifierStage } from "../PipelineStages.types";
import getLegacyScopeStage from "./getLegacyScopeStage";
import { getPreferredScope, getRightScope } from "./getPreferredScope";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * This modifier returns all scopes intersecting the input target if the target
 * has an explicit range (ie {@link Target.hasExplicitRange} is `true`).  If the
 * target does not have an explicit range, this modifier returns all scopes in
 * the canonical iteration scope defined by the scope handler.
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
    const scopeHandler = getScopeHandler(
      this.modifier.scopeType,
      target.editor.document.languageId
    );

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    return target.hasExplicitRange
      ? this.handleExplicitRangeTarget(scopeHandler, target)
      : this.handleNoExplicitRangeTarget(scopeHandler, target);
  }

  private handleExplicitRangeTarget(
    scopeHandler: ScopeHandler,
    target: Target
  ): Target[] {
    const { editor, isReversed, contentRange: range } = target;
    const { scopeType } = this.modifier;

    const scopes = scopeHandler.getScopesOverlappingRange(editor, range);

    if (scopes.length === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return scopes.map((scope) => scope.getTarget(isReversed));
  }

  private handleNoExplicitRangeTarget(
    scopeHandler: ScopeHandler,
    target: Target
  ): Target[] {
    const {
      editor,
      isReversed,
      contentRange: { start, end },
    } = target;
    const { scopeType } = this.modifier;

    const startIterationScopes =
      scopeHandler.getIterationScopesTouchingPosition(editor, start);

    // If target is empty, use the preferred scope; otherwise use the rightmost
    // scope, as that one will have non-empty intersection with input target
    // content range
    const startIterationScope = end.isEqual(start)
      ? getPreferredScope(startIterationScopes)
      : getRightScope(startIterationScopes);

    if (startIterationScope == null) {
      throw new NoContainingScopeError(scopeType.type);
    }

    if (!startIterationScope.domain.contains(end)) {
      // NB: This shouldn't really happen, because our weak scopes are
      // generally no bigger than a token.
      throw new Error(
        "Canonical iteration scope domain must include entire input range"
      );
    }

    return startIterationScope
      .getScopes()
      .map((scope) => scope.getTarget(isReversed));
  }
}
