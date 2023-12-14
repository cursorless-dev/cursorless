import {
  TextEditor,
  type Range,
  type RelativeScopeModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import type {
  ContainmentPolicy,
  ScopeHandler,
} from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
export class RelativeExclusiveScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifierStageFactory, this.modifier, target);
    }

    let targets = getTargetsForIterationScope(
      this.scopeHandlerFactory,
      scopeHandler,
      target,
      this.modifier,
    );

    if (targets != null) {
      return targets;
    }

    targets = getTargetsForPosition(scopeHandler, target, this.modifier);

    if (targets != null) {
      return targets;
    }

    throw new OutOfRangeError();
  }
}

function getTargetsForIterationScope(
  scopeHandlerFactory: ScopeHandlerFactory,
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
) {
  let scopes = getDefaultIterationRange(
    scopeHandler,
    scopeHandlerFactory,
    target,
  )?.flatMap((iterationRange) =>
    getScopesOverlappingRange(scopeHandler, target.editor, iterationRange),
  );

  if (scopes == null) {
    return undefined;
  }

  if (modifier.direction === "backward") {
    scopes = scopes.reverse();
  }

  return scopesToTargets(scopes, target, modifier);
}

function scopesToTargets(
  scopes: TargetScope[],
  target: Target,
  modifier: RelativeScopeModifier,
): Target[] | undefined {
  const { isReversed, contentRange } = target;
  const { length: desiredScopeCount, direction, offset } = modifier;
  const isForward = direction === "forward";
  const initialPosition = isForward ? contentRange.end : contentRange.start;

  let scopeCount = 0;
  let proximalScope: TargetScope | undefined;

  for (const scope of scopes) {
    if (contentRange.isEmpty) {
      if (isForward) {
        if (scope.domain.start.isBeforeOrEqual(initialPosition)) {
          continue;
        }
      } else if (scope.domain.end.isAfterOrEqual(initialPosition)) {
        continue;
      }
    } else {
      if (isForward) {
        if (scope.domain.start.isBefore(initialPosition)) {
          continue;
        }
      } else if (scope.domain.end.isAfter(initialPosition)) {
        continue;
      }
    }

    scopeCount += 1;

    if (scopeCount < offset) {
      // Skip until we hit `offset`
      continue;
    }

    if (scopeCount === offset) {
      // When we hit offset, that becomes proximal scope
      if (desiredScopeCount === 1) {
        // Just yield it if we only want 1 scope
        return scope.getTargets(isReversed);
      }

      proximalScope = scope;
      continue;
    }

    if (scopeCount === offset + desiredScopeCount - 1) {
      // Then make a range when we get the desired number of scopes
      return constructScopeRangeTarget(isReversed, proximalScope!, scope);
    }
  }

  return undefined;
}

function getTargetsForPosition(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Target[] | undefined {
  const { isReversed, editor, contentRange } = target;
  const { length: desiredScopeCount, direction, offset } = modifier;

  const initialPosition =
    direction === "forward" ? contentRange.end : contentRange.start;

  // If inputRange is empty, then we skip past any scopes that start at
  // contentRange. Otherwise just disallow any scopes that start strictly
  // before the end of input range (strictly after for "backward").
  const containment: ContainmentPolicy = contentRange.isEmpty
    ? "disallowed"
    : "disallowedIfStrict";

  const scopes = scopeHandler.generateScopes(
    editor,
    initialPosition,
    direction,
    {
      containment,
      skipAncestorScopes: true,
    },
  );

  let scopeCount = 0;
  let proximalScope: TargetScope | undefined;

  for (const scope of scopes) {
    scopeCount += 1;

    if (scopeCount < offset) {
      // Skip until we hit `offset`
      continue;
    }

    if (scopeCount === offset) {
      // When we hit offset, that becomes proximal scope
      if (desiredScopeCount === 1) {
        // Just yield it if we only want 1 scope
        return scope.getTargets(isReversed);
      }

      proximalScope = scope;
      continue;
    }

    if (scopeCount === offset + desiredScopeCount - 1) {
      // Then make a range when we get the desired number of scopes
      return constructScopeRangeTarget(isReversed, proximalScope!, scope);
    }
  }

  return undefined;
}

function getDefaultIterationRange(
  scopeHandler: ScopeHandler,
  scopeHandlerFactory: ScopeHandlerFactory,
  target: Target,
): Range[] | undefined {
  const iterationScopeHandler = scopeHandlerFactory.create(
    scopeHandler.iterationScopeType,
    target.editor.document.languageId,
  );

  if (iterationScopeHandler == null) {
    return undefined;
  }

  const iterationScopeTarget = getContainingScopeTarget(
    target,
    iterationScopeHandler,
  );

  if (iterationScopeTarget == null) {
    return undefined;
  }

  return iterationScopeTarget.map((target) => target.contentRange);
}

function getScopesOverlappingRange(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  { start, end }: Range,
): TargetScope[] {
  return Array.from(
    scopeHandler.generateScopes(editor, start, "forward", {
      distalPosition: end,
      skipAncestorScopes: true,
    }),
  );
}
