import type { ContainingScopeModifier } from "@cursorless/common";
import { NoContainingScopeError } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { getContainingScopeTarget } from "./getContainingScopeTarget";
import type { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";

/**
 * This modifier stage expands from the input target to the smallest containing
 * scope.  We proceed as follows:
 *
 * 1. Expand to smallest scope(s) touching start position of input target's
 *    content range
 * 2. If input target has an empty content range, return the start scope,
 *    breaking ties as defined by {@link ScopeHandler.isPreferredOver} when more
 *    than one scope touches content range
 * 3. Otherwise, if end of input target is weakly contained by the domain of the
 *    rightmost start scope, return rightmost start scope.  We return rightmost
 *    because that will have non-empty intersection with input target content
 *    range.
 * 4. Otherwise, expand from end of input target and form a range from rightmost
 *    start scope through leftmost end scope.  We use rightmost start scope and
 *    leftmost end scope because those will have non-empty intersection with
 *    input target content range.
 */
export class ContainingScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: ContainingScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const { scopeType, ancestorIndex = 0 } = this.modifier;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      target.editor.document.languageId,
    );

    const containingScopes = getContainingScopeTarget(
      target,
      scopeHandler,
      ancestorIndex,
    );

    if (containingScopes == null) {
      throw new NoContainingScopeError(scopeType.type);
    }

    return containingScopes;
  }
}
