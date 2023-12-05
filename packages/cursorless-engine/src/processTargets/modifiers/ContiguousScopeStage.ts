import type {
  ContiguousScopeModifier,
  Direction,
  Position,
  TextEditor,
} from "@cursorless/common";
import { NoContainingScopeError } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
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
export class ContiguousScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: ContiguousScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType } = this.modifier;
    const { editor, isReversed, contentRange } = target;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      throw new NoContainingScopeError(scopeType.type);
    }

    const start = getDistalScope(
      scopeHandler,
      editor,
      contentRange.start,
      "backward",
    );
    const end = getDistalScope(
      scopeHandler,
      editor,
      contentRange.end,
      "forward",
    );

    if (start == null || end == null) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return [
      new Target...
    ]

    // return scopes.flatMap((scope) => scope.getTargets(isReversed));
  }
}

function getDistalScope(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
): TargetScope | undefined {
  let result: TargetScope | undefined;

  const generator = scopeHandler.generateScopes(editor, position, direction, {
    skipAncestorScopes: true,
  });

  for (const scope of generator) {
    if (result == null) {
      result = scope;
      continue;
    }

    const [previousScope, nextScope] = (() => {
      if (direction === "forward") {
        return [result, scope];
      }
      return [scope, result];
    })();

    if (isAdjacent(previousScope, nextScope)) {
      result = scope;
    }
  }

  return result;
}

function isAdjacent(
  previousScope: TargetScope,
  nextScope: TargetScope,
): boolean {}
