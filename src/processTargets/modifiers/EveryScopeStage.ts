import { NoContainingScopeError } from "../../errors";
import type { Target } from "../../typings/target.types";
import type { EveryScopeModifier } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "./scopeHandlers/getScopeHandler";
import type { ModifierStage } from "../PipelineStages.types";
import getLegacyScopeStage from "./getLegacyScopeStage";
import { getPreferredScope, getRightScope } from "./getPreferredScope";

export class EveryScopeStage implements ModifierStage {
  constructor(private modifier: EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const { editor, isReversed, contentRange: range } = target;
    const { scopeType } = this.modifier;

    const scopeHandler = getScopeHandler(
      scopeType,
      target.editor.document.languageId
    );

    if (scopeHandler == null) {
      return getLegacyScopeStage(this.modifier).run(context, target);
    }

    if (target.hasExplicitRange) {
      const scopes = scopeHandler.getScopesOverlappingRange(editor, range);

      if (scopes.length === 0) {
        throw new NoContainingScopeError(scopeType.type);
      }

      return scopes.map((scope) => scope.getTarget(isReversed));
    }

    const { start, end } = range;

    const startIterationScopes =
      scopeHandler.getIterationScopesTouchingPosition(editor, start);

    const startIterationScope = end.isEqual(start)
      ? getPreferredScope(startIterationScopes)
      : getRightScope(startIterationScopes);

    if (startIterationScope == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
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
