import {
  NoContainingScopeError,
  Range,
  RelativeScopeModifier,
  TextEditor,
} from "@cursorless/common";
import { itake } from "itertools";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import { getPreferredScopeTouchingPosition } from "./getPreferredScopeTouchingPosition";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";
import { PlainTarget } from "../targets";
/**
 * Handles relative modifiers that include targets intersecting with the input,
 * eg `"two funks"`, `"token backward"`, etc.  Proceeds as follows:
 *
 * 1. Constructs the initial range to use as the starting point for the relative
 *    scope search.  Expands from the proximal end of the input target (start
 *    for "forward", end for "backward") to the smallest containing scope,
 *    breaking ties in direction {@link direction} rather than the tie-breaking
 *    heuristics we use for containing scope, to make this modifier easier to
 *    reason about when between scopes.
 * 2. Calls {@link ScopeHandler.generateScopes} to get as many scopes as
 *    desired, starting from the proximal end of the initial range (ie the start
 *    if direction is "forward", the end if direction is "backward").
 */
export class RelativeInclusiveScopeStage implements ModifierStage {
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

    const { isReversed, editor, contentRange } = target;
    const { length: desiredScopeCount, direction } = this.modifier;

    // const initialRange = getPreferredScopeTouchingPosition(
    //   scopeHandler,
    //   editor,
    //   direction === "forward" ? contentRange.start : contentRange.end,
    //   direction,
    // )?.domain;

    const containingTargets = getContainingScopeTarget(target, scopeHandler);

    if (containingTargets) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    let it = scopeHandler.isHierarchical
      ? getScopesForIterationScope(
          this.scopeHandlerFactory,
          scopeHandler,
          editor,
          initialRange,
          this.modifier,
        )
      : undefined;

    if (it == null) {
      const initialPosition =
        direction === "forward" ? initialRange.start : initialRange.end;
      it = scopeHandler.generateScopes(editor, initialPosition, direction, {
        skipAncestorScopes: true,
      });
    }

    const scopes = Array.from(itake(desiredScopeCount, it));

    if (scopes.length < desiredScopeCount) {
      throw new OutOfRangeError();
    }

    return constructScopeRangeTarget(
      isReversed,
      scopes[0],
      scopes[scopes.length - 1],
    );
  }
}

function* getScopesForIterationScope(
  scopeHandlerFactory: ScopeHandlerFactory,
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  range: Range,
  modifier: RelativeScopeModifier,
): Iterable<TargetScope> | undefined {
  const { direction } = modifier;
  const isForward = direction === "forward";
  const initialPosition = isForward ? range.start : range.end;

  const iterationScopeHandler = scopeHandlerFactory.create(
    scopeHandler.iterationScopeType,
    editor.document.languageId,
  );

  if (iterationScopeHandler == null) {
    return undefined;
  }

  // const iterationScopeTarget = getContainingScopeTarget(
  //   target,
  //   iterationScopeHandler,
  // );

  // if (iterationScopeTarget == null) {
  //   return undefined;
  // }

  const initialIterationRange = getPreferredScopeTouchingPosition(
    iterationScopeHandler,
    editor,
    initialPosition,
    direction,
  )?.domain;

  if (initialIterationRange == null) {
    return undefined;
  }

  const iterationScopes = iterationScopeHandler.generateScopes(
    editor,
    initialPosition,
    direction,
    { skipAncestorScopes: true, allowAdjacentScopes: true },
  );

  for (const iterationScope of iterationScopes) {
    for (const iterationTarget of iterationScope.getTargets(false)) {
      console.log("iter", iterationTarget.contentRange.toString());
      const { start, end } = iterationTarget.contentRange;
      const proximalPosition = isForward ? start : end;
      const distalPosition = isForward ? end : start;
      const scopes = scopeHandler.generateScopes(
        editor,
        proximalPosition,
        direction,
        { skipAncestorScopes: true, distalPosition },
      );
      for (const scope of scopes) {
        console.log("scope", scope.domain.toString());
        yield scope;
      }
    }
  }

  let scopes = getDefaultIterationRanges(
    scopeHandler,
    scopeHandlerFactory,
    editor,
    range,
  )?.flatMap((iterationRange) =>
    getScopesOverlappingRange(scopeHandler, editor, iterationRange),
  );

  if (scopes == null) {
    return undefined;
  }

  if (!isForward) {
    scopes = scopes.reverse();
  }

  const index = scopes.findIndex((scope) =>
    scope.domain.contains(initialPosition),
  );

  if (index < 0) {
    return undefined;
  }

  return scopes.slice(index);
}

function getDefaultIterationRanges(
  scopeHandler: ScopeHandler,
  scopeHandlerFactory: ScopeHandlerFactory,
  editor: TextEditor,
  range: Range,
): Range[] | undefined {
  const iterationScopeHandler = scopeHandlerFactory.create(
    scopeHandler.iterationScopeType,
    editor.document.languageId,
  );

  if (iterationScopeHandler == null) {
    return undefined;
  }

  const iterationScopeTarget = getContainingScopeTarget(
    new PlainTarget({ editor, contentRange: range, isReversed: false }),
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

export function ensureSingleTarget(targets: Target[]): Target {
  if (targets.length !== 1) {
    throw new Error("Can only have one target with this modifier");
  }

  return targets[0];
}
