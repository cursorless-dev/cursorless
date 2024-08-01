import { type Position, type PreferredScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";

/**
 * This modifier tries to find the preferred scope for the target.
 * It does this by first looking for a containing scope, and if that fails,
 * it looks for the closest scope.
 */
export class PreferredScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: PreferredScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;

    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      throw Error(`Couldn't create scope handler for: ${scopeType.type}`);
    }

    const containingTargets = getContainingScopeTarget(target, scopeHandler);

    if (containingTargets != null) {
      return containingTargets;
    }

    const closestTargets = this.getClosestScopeTargets(target, scopeHandler);

    if (closestTargets != null) {
      return closestTargets;
    }

    throw Error(`No scopes found for scope type: ${scopeType.type}`);
  }

  private getClosestScopeTargets(
    target: Target,
    scopeHandler: ScopeHandler,
  ): Target[] | undefined {
    const previousScopes = scopeHandler.generateScopes(
      target.editor,
      target.contentRange.start,
      "backward",
    );
    const nextScopes = scopeHandler.generateScopes(
      target.editor,
      target.contentRange.end,
      "forward",
    );

    const { active } = target.contentSelection;
    const previousScope = getPreferredScope(previousScopes, active);
    const nextScope = getPreferredScope(nextScopes, active);

    const preferredScope =
      previousScope.distance < nextScope.distance
        ? previousScope.scope
        : nextScope.scope;

    return preferredScope != null
      ? preferredScope.getTargets(target.isReversed)
      : undefined;
  }
}

function getPreferredScope(scopes: Iterable<TargetScope>, position: Position) {
  let preferredScope: TargetScope | undefined;
  let preferredDistance = Infinity;
  for (const scope of scopes) {
    const distance = Math.min(
      distanceBetweenPositions(position, scope.domain.start),
      distanceBetweenPositions(position, scope.domain.end),
    );
    if (distance < preferredDistance) {
      preferredScope = scope;
      preferredDistance = distance;
    } else {
      break;
    }
  }
  return { scope: preferredScope, distance: preferredDistance };
}

function distanceBetweenPositions(a: Position, b: Position): number {
  return (
    Math.abs(a.line - b.line) * 10000 + Math.abs(a.character - b.character)
  );
}
