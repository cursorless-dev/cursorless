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

    if (targets == null) {
      targets = getTargetsForPosition(scopeHandler, target, this.modifier);
    }

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
): Target[] | undefined {
  const { contentRange } = target;
  const isForward = modifier.direction === "forward";
  const initialPosition = isForward ? contentRange.end : contentRange.start;

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

  if (!isForward) {
    scopes = scopes.reverse();
  }

  const index = (() => {
    if (contentRange.isEmpty) {
      if (isForward) {
        return scopes.findIndex((scope) =>
          scope.domain.start.isAfter(initialPosition),
        );
      }
      return scopes.findIndex((scope) =>
        scope.domain.end.isBefore(initialPosition),
      );
    }
    if (isForward) {
      return scopes.findIndex((scope) =>
        scope.domain.start.isAfterOrEqual(initialPosition),
      );
    }
    return scopes.findIndex((scope) =>
      scope.domain.end.isBeforeOrEqual(initialPosition),
    );
  })();

  if (index < 0) {
    return undefined;
  }

  scopes = scopes.slice(index);

  return scopesToTargets(scopes, target, modifier);
}

function getTargetsForPosition(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Target[] | undefined {
  const { editor, contentRange } = target;
  const { direction } = modifier;

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

  return scopesToTargets(scopes, target, modifier);
}

function scopesToTargets(
  scopes: Iterable<TargetScope>,
  target: Target,
  modifier: RelativeScopeModifier,
): Target[] | undefined {
  const { isReversed } = target;
  const { length: desiredScopeCount, offset } = modifier;

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
