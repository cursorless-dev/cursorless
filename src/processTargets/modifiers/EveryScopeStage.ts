import { Range } from "vscode";
import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { EveryScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import type { ModifierStage } from "../PipelineStages.types";
import getLegacyScopeStage from "./getLegacyScopeStage";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * This modifier returns all scopes intersecting the input target if the target
 * has an explicit range (ie {@link Target.hasExplicitRange} is `true`).  If the
 * target does not have an explicit range, this modifier returns all scopes in
 * the canonical iteration scope defined by the scope handler in
 * {@link ScopeHandler.getIterationScopesTouchingPosition}.
 *
 * We proceed as follows:
 *
 * 1. If target has an explicit range, call
 *    {@link ScopeHandler.getScopesOverlappingRange} on our scope handler.  If
 *    we get back at least one {@link TargetScope} whose
 *    {@link TargetScope.domain|domain} terminates within the input target
 *    range, just return all targets directly.
 * 2. If we didn't get any scopes that terminate within the input target, or if
 *    the target had no explicit range, then expand to the containing instance
 *    of {@link ScopeHandler.iterationScopeType}, and then return all targets
 *    returned from {@link ScopeHandler.getScopesOverlappingRange} when applied
 *    to the expanded target's {@link Target.contentRange}.
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

    let scopes: TargetScope[];
    if (target.hasExplicitRange) {
      scopes = scopeHandler.getScopesOverlappingRange(
        editor,
        target.contentRange
      );

      if (
        scopes.length === 1 &&
        scopes[0].domain.contains(target.contentRange)
      ) {
        const range = this.getDefaultIterationRange(
          context,
          scopeHandler,
          target
        );
        scopes = scopeHandler.getScopesOverlappingRange(editor, range);
      }
    } else {
      const range = target.hasExplicitRange
        ? target.contentRange
        : this.getDefaultIterationRange(context, scopeHandler, target);

      scopes = scopeHandler.getScopesOverlappingRange(editor, range);
    }

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
    const containingIterationScopeModifier = getModifierStage({
      type: "containingScope",
      scopeType: scopeHandler.iterationScopeType,
    });

    return containingIterationScopeModifier.run(context, target)[0]
      .contentRange;
  }
}
