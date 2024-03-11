import {
  ContainingScopeModifier,
  NoContainingScopeError,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { getContainingScopeTarget } from "./getContainingScopeTarget";

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

  async run(target: Target): Promise<Target[]> {
    const { scopeType, ancestorIndex = 0 } = this.modifier;

    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return this.modifierStageFactory
        .getLegacyScopeStage(this.modifier)
        .run(target);
    }

    const containingScope = getContainingScopeTarget(
      target,
      scopeHandler,
      ancestorIndex,
    );

    if (containingScope == null) {
      if (scopeType.type === "collectionItem") {
        // For `collectionItem`, fall back to generic implementation
        return this.modifierStageFactory
          .getLegacyScopeStage(this.modifier)
          .run(target);
      }

      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return containingScope;
  }
}
