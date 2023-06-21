import type { EveryScopeModifier, TextEditor } from "@cursorless/common";
import { NoContainingScopeError, Range } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
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
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: EveryScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;
    const { editor, isReversed } = target;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      return this.modifierStageFactory
        .getLegacyScopeStage(this.modifier)
        .run(target);
    }

    let scopes: TargetScope[] | undefined;

    if (target.hasExplicitRange) {
      scopes = getScopesOverlappingRange(
        scopeHandler,
        editor,
        target.contentRange,
      );

      if (
        scopes.length === 1 &&
        scopes[0].domain.contains(target.contentRange)
      ) {
        // If the only scope that came back completely contains the input target
        // range, we treat the input as if it had no explicit range, expanding
        // to default iteration socpe below
        scopes = undefined;
      }
    }

    if (scopes == null) {
      // If target had no explicit range, or was contained by a single target
      // instance, expand to iteration scope before overlapping
      scopes = this.getDefaultIterationRange(
        scopeHandler,
        this.scopeHandlerFactory,
        target,
      ).flatMap((iterationRange) =>
        getScopesOverlappingRange(scopeHandler, editor, iterationRange),
      );
    }

    if (scopes.length === 0) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return scopes.flatMap((scope) => scope.getTargets(isReversed));
  }

  getDefaultIterationRange(
    scopeHandler: ScopeHandler,
    scopeHandlerFactory: ScopeHandlerFactory,
    target: Target,
  ): Range[] {
    const iterationScopeHandler = scopeHandlerFactory.create(
      scopeHandler.iterationScopeType,
      target.editor.document.languageId,
    );

    if (iterationScopeHandler == null) {
      throw Error("Could not find iteration scope handler");
    }

    const iterationScopeTarget = getContainingScopeTarget(
      target,
      iterationScopeHandler,
    );

    if (iterationScopeTarget == null) {
      throw new NoContainingScopeError(
        `iteration scope for ${scopeHandler.scopeType!.type}`,
      );
    }

    return iterationScopeTarget.map((target) => target.contentRange);
  }
}

/**
 * Returns a list of all scopes that have nonempty overlap with {@link range}.
 */
export function getScopesOverlappingRange(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  { start, end }: Range,
): TargetScope[] {
  return Array.from(
    scopeHandler.generateScopes(editor, start, "forward", {
      distalPosition: end,
      skipAncestorScopes: true,
      allowAdjacentScopes: scopeHandler.includeAdjacentInEvery,
    }),
  );
}
