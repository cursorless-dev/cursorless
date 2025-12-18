import type {
  Direction,
  Position,
  Range,
  RelativeScopeModifier,
  TextEditor,
} from "@cursorless/common";
import { NoContainingScopeError } from "@cursorless/common";
import { find, ifilter, islice, itake } from "itertools";
import type { Target } from "../../typings/target.types";
import type { ModifierStage } from "../PipelineStages.types";
import { InteriorTarget } from "../targets";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getPreferredScopeTouchingPosition } from "./getPreferredScopeTouchingPosition";
import { OutOfRangeError } from "./listUtils";
import type { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type {
  ContainmentPolicy,
  ScopeHandler,
} from "./scopeHandlers/scopeHandler.types";

/**
 * Handles relative modifiers input, eg "next funk", "two funks", "previous two
 * tokens". Proceeds by running {@link ScopeHandler.generateScopes} to get the
 * desired scopes, skipping the first scope if input range is empty and is at
 * start of that scope.
 */
export class RelativeScopeStage implements ModifierStage {
  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    const scopes = Array.from(
      this.modifier.offset === 0
        ? generateScopesInclusive(scopeHandler, target, this.modifier)
        : generateScopesExclusive(
            this.scopeHandlerFactory,
            scopeHandler,
            target,
            this.modifier,
          ),
    );

    if (scopes.length < this.modifier.length) {
      throw new OutOfRangeError(
        this.modifier.scopeType,
        this.modifier.offset + this.modifier.length - 1,
      );
    }

    const { isReversed } = target;

    if (this.modifier.isEvery) {
      return scopes.flatMap((scope) => scope.getTargets(isReversed));
    }

    return constructScopeRangeTarget(
      isReversed,
      scopes[0],
      scopes[scopes.length - 1],
    );
  }
}

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
function generateScopesInclusive(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Iterable<TargetScope> {
  const { editor, contentRange } = target;
  const { length: desiredScopeCount, direction } = modifier;

  const initialRange = getPreferredScopeTouchingPosition(
    scopeHandler,
    editor,
    direction === "forward" ? contentRange.start : contentRange.end,
    direction,
  )?.domain;

  if (initialRange == null) {
    throw new NoContainingScopeError(modifier.scopeType.type);
  }

  return itake(
    desiredScopeCount,
    scopeHandler.generateScopes(
      editor,
      direction === "forward" ? initialRange.start : initialRange.end,
      direction,
      {
        skipAncestorScopes: true,
      },
    ),
  );
}

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
function generateScopesExclusive(
  scopeHandlerFactory: ScopeHandlerFactory,
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Iterable<TargetScope> {
  const { editor, contentRange: inputRange } = target;
  const { length: desiredScopeCount, direction, offset } = modifier;

  const initialPosition =
    direction === "forward" ? inputRange.end : inputRange.start;

  // If inputRange is empty, then we skip past any scopes that start at
  // inputRange.  Otherwise just disallow any scopes that start strictly
  // before the end of input range (strictly after for "backward").
  const containment: ContainmentPolicy | undefined = inputRange.isEmpty
    ? "disallowed"
    : "disallowedIfStrict";

  let scopes = scopeHandler.generateScopes(editor, initialPosition, direction, {
    containment,
    skipAncestorScopes: true,
  });

  const interiorRanges = getExcludedInteriorRanges(
    scopeHandlerFactory,
    scopeHandler,
    editor,
    initialPosition,
    direction,
  );

  if (interiorRanges.length > 0) {
    scopes = ifilter(
      scopes,
      (s) => !interiorRanges.some((r) => r.contains(s.domain)),
    );
  }

  return islice(scopes, offset - 1, offset + desiredScopeCount - 1);
}

/**
 * Gets the scope range(s) within the containing scope of
 * {@link initialPosition} that should be used to exclude next / previous
 * scopes.
 *
 * The idea is that when you're in the headline of an if statement / function /
 * etc, you're thinking at the same level as that scope, so the next scope
 * should be outside of it. But when you're inside the body, the next scope
 * should be within it.
 *
 * For example, in the following code:
 *
 * ```typescript
 * if (aaa) {
 *   bbb();
 *   ccc();
 * }
 * ddd();
 * ```
 *
 * The target `"next state air"` should refer to `ddd();`, not `bbb();`.
 * However, `"next state bat"` should refer to `ccc();`.
 */
function getExcludedInteriorRanges(
  scopeHandlerFactory: ScopeHandlerFactory,
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  initialPosition: Position,
  direction: Direction,
): Range[] {
  const containingScopeTarget = getContainingScopeTarget(
    scopeHandler,
    editor,
    initialPosition,
    direction,
  );

  // No containing scope, nothing to exclude.
  if (containingScopeTarget == null) {
    return [];
  }

  const containingInteriorTargets = containingScopeTarget.getInterior();

  // Containing target already has an interior. eg a surrounding pair scope.
  if (containingInteriorTargets != null) {
    return getFilteredInteriorRanges(
      containingInteriorTargets,
      initialPosition,
    );
  }

  // Fallback to language specific interior scope handler
  const interiorScopeHandler = scopeHandlerFactory.maybeCreate(
    { type: "interior" },
    editor.document.languageId,
  );

  // No interior scope handler, nothing to exclude.
  // For languages that hasn't defined the interior scope handler yet we default
  // to NOT excluding anything.
  if (interiorScopeHandler == null) {
    return [];
  }

  const containingPositions = getPositions(
    containingScopeTarget.contentRange,
    direction,
  );

  const interiorScopes = interiorScopeHandler.generateScopes(
    editor,
    containingPositions.initial,
    direction,
    {
      skipAncestorScopes: true,
      distalPosition: containingPositions.distal,
    },
  );

  const interiorTargets = Array.from(interiorScopes).flatMap((s) =>
    s.getTargets(false),
  );

  if (interiorTargets.length > 0) {
    return getFilteredInteriorRanges(interiorTargets, initialPosition);
  }

  // This containing scope has no interior.
  // Default to excluding the entire containing scope.
  return [containingScopeTarget.contentRange];
}

function getPositions(range: Range, direction: Direction) {
  return direction === "forward"
    ? { initial: range.start, distal: range.end }
    : { initial: range.end, distal: range.start };
}

function getFilteredInteriorRanges(
  interiorTargets: Target[],
  initialPosition: Position,
) {
  // Interiors containing the initial position are excluded. This happens when
  // you are in the body of an if statement and use `next state` and in that
  // case we don't want to exclude scopes within the same interior.
  return interiorTargets
    .map((t) =>
      t instanceof InteriorTarget ? t.fullInteriorRange : t.contentRange,
    )
    .filter((r) => !r.contains(initialPosition));
}

function getContainingScopeTarget(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  initialPosition: Position,
  direction: Direction,
): Target | undefined {
  return find(
    scopeHandler.generateScopes(editor, initialPosition, direction, {
      containment: "required",
      allowAdjacentScopes: true,
      skipAncestorScopes: true,
    }),
  )?.getTargets(false)[0];
}
